import logging
import os
from pathlib import Path

import firebase_admin
from firebase_admin import auth, credentials, firestore, storage
from flask import Flask, jsonify, request
from flask_cors import CORS

BASE_DIR = Path(__file__).resolve().parent
SERVICE_ACCOUNT_PATH = Path(
    os.getenv("FIREBASE_SERVICE_ACCOUNT", BASE_DIR / "serviceAccountKey.json")
)
ADMIN_EMAIL = "sylwia.szyja14@gmail.com"

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
logger = logging.getLogger("strona-mamy-api")

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})


def initialize_firebase():
    if not SERVICE_ACCOUNT_PATH.is_file():
        raise FileNotFoundError(
            f"Nie znaleziono klucza Firebase: {SERVICE_ACCOUNT_PATH}"
        )

    if not firebase_admin._apps:
        firebase_admin.initialize_app(
            credentials.Certificate(str(SERVICE_ACCOUNT_PATH)),
            {"storageBucket": os.getenv("FIREBASE_STORAGE_BUCKET", "strona-mamy-146b5.firebasestorage.app")},
        )
        logger.info("Firebase Admin SDK zostało zainicjalizowane.")


def user_payload(user):
    return {
        "uid": user.uid,
        "email": user.email,
        "name": user.display_name or "",
        "emailVerified": user.email_verified,
    }


def require_admin():
    header = request.headers.get("Authorization", "")
    if not header.startswith("Bearer "):
        return None, (jsonify({"success": False, "error": "Brak tokenu logowania."}), 401)

    try:
        decoded = auth.verify_id_token(header.removeprefix("Bearer ").strip())
        email = (decoded.get("email") or "").strip().lower()
        if email != ADMIN_EMAIL:
            logger.warning("Odmowa dostępu administratora dla: %s", email or "brak e-maila")
            return None, (jsonify({"success": False, "error": "Brak uprawnień administratora."}), 403)
        return decoded, None
    except Exception as error:
        logger.warning("Nieprawidłowy token administratora: %s", error)
        return None, (jsonify({"success": False, "error": "Nieprawidłowy token logowania."}), 401)


@app.post("/admin/posts")
def create_post():
    decoded, error_response = require_admin()
    if error_response:
        return error_response

    title = str(request.form.get("title", "")).strip()
    content = str(request.form.get("content", "")).strip()
    image = request.files.get("image")
    if not title or not content:
        return jsonify({"success": False, "error": "Tytuł i treść posta są wymagane."}), 400

    image_url = ""
    if image and image.filename:
        try:
            bucket = storage.bucket()
            blob = bucket.blob(f"posts/{decoded['uid']}/{image.filename}")
            blob.upload_from_file(image.stream, content_type=image.content_type)
            blob.make_public()
            image_url = blob.public_url
        except Exception:
            logger.exception("Nie udało się zapisać zdjęcia posta w Firebase Storage.")
            return jsonify({
                "success": False,
                "error": "Nie udało się zapisać zdjęcia. Włącz Firebase Storage dla tego projektu i spróbuj ponownie.",
            }), 503

    user_record = auth.get_user(decoded["uid"])
    author_name = (
        user_record.display_name
        or decoded.get("name")
        or decoded.get("email", "").split("@")[0]
        or "Twórca"
    )
    document = {
        "title": title,
        "content": content,
        "imageUrl": image_url,
        "authorUid": decoded["uid"],
        "authorEmail": decoded.get("email", ""),
        "authorName": author_name,
        "authorRole": "Twórca",
        "createdAt": firestore.SERVER_TIMESTAMP,
    }
    post_ref = firestore.client().collection("posts").add(document)[1]
    logger.info("Administrator %s opublikował post %s", decoded.get("email"), post_ref.id)
    return jsonify({"success": True, "id": post_ref.id}), 201


@app.get("/admin/posts")
def admin_posts():
    _, error_response = require_admin()
    if error_response:
        return error_response

    result = []
    for document in firestore.client().collection("posts").stream():
        data = document.to_dict()
        result.append({
            "id": document.id,
            "title": data.get("title", ""),
            "authorName": data.get("authorName", ""),
            "authorEmail": data.get("authorEmail", ""),
        })
    return jsonify({"success": True, "posts": result})


@app.delete("/admin/posts/<post_id>")
def delete_post(post_id):
    decoded, error_response = require_admin()
    if error_response:
        return error_response

    post_ref = firestore.client().collection("posts").document(post_id)
    if not post_ref.get().exists:
        return jsonify({"success": False, "error": "Nie znaleziono posta."}), 404

    post_ref.delete()
    logger.info("Administrator %s usunął post %s", decoded.get("email"), post_id)
    return jsonify({"success": True})


@app.post("/admin/users/block")
def block_user():
    decoded, error_response = require_admin()
    if error_response:
        return error_response

    data = request.get_json(silent=True) or {}
    email = str(data.get("email", "")).strip().lower()
    blocked = data.get("blocked")
    if not email or not isinstance(blocked, bool):
        return jsonify({"success": False, "error": "Podaj e-mail i wybierz działanie."}), 400
    if email == ADMIN_EMAIL:
        return jsonify({"success": False, "error": "Nie można zablokować konta administratora."}), 400

    try:
        user = auth.get_user_by_email(email)
        auth.update_user(user.uid, disabled=blocked)
    except auth.UserNotFoundError:
        return jsonify({"success": False, "error": "Nie znaleziono takiego konta."}), 404
    except Exception:
        logger.exception("Nie udało się zmienić dostępu dla konta %s.", email)
        return jsonify({"success": False, "error": "Nie udało się zmienić dostępu do konta."}), 503

    action = "zablokował" if blocked else "odblokował"
    logger.info("Administrator %s %s konto %s", decoded.get("email"), action, email)
    return jsonify({"success": True, "blocked": blocked})


@app.post("/admin/notifications")
def create_notification():
    decoded, error_response = require_admin()
    if error_response:
        return error_response

    title = str(request.form.get("title", "")).strip()
    message = str(request.form.get("message", "")).strip()
    if not title or not message:
        return jsonify({
            "success": False,
            "error": "Tytuł i treść powiadomienia są wymagane.",
        }), 400
    if len(title) > 120 or len(message) > 500:
        return jsonify({
            "success": False,
            "error": "Powiadomienie jest za długie.",
        }), 400

    notification_ref = firestore.client().collection("notifications").add({
        "title": title,
        "message": message,
        "authorUid": decoded["uid"],
        "createdAt": firestore.SERVER_TIMESTAMP,
    })[1]
    logger.info(
        "Administrator %s wysłał powiadomienie %s",
        decoded.get("email"),
        notification_ref.id,
    )
    return jsonify({"success": True, "id": notification_ref.id}), 201


@app.delete("/admin/notifications/<notification_id>")
def delete_notification(notification_id):
    decoded, error_response = require_admin()
    if error_response:
        return error_response

    notification_ref = firestore.client().collection("notifications").document(notification_id)
    if not notification_ref.get().exists:
        return jsonify({"success": False, "error": "Nie znaleziono wiadomości."}), 404

    notification_ref.delete()
    logger.info(
        "Administrator %s usunął wiadomość %s",
        decoded.get("email"),
        notification_id,
    )
    return jsonify({"success": True})


@app.post("/register")
def register():
    data = request.get_json(silent=True) or {}
    name = str(data.get("name", "")).strip()
    email = str(data.get("email", "")).strip().lower()
    password = str(data.get("password", ""))

    logger.info("Próba rejestracji: %s", email or "brak e-maila")

    if not email or not password:
        return jsonify({
            "success": False,
            "code": "missing-fields",
            "error": "Podaj e-mail i hasło.",
        }), 400

    if len(password) < 6:
        return jsonify({
            "success": False,
            "code": "weak-password",
            "error": "Hasło musi mieć co najmniej 6 znaków.",
        }), 400

    try:
        user = auth.create_user(
            email=email,
            password=password,
            display_name=name or None,
        )
        logger.info("Utworzono konto: uid=%s email=%s", user.uid, user.email)
        return jsonify({
            "success": True,
            "created": True,
            "message": "Konto zostało utworzone.",
            "user": user_payload(user),
        }), 201
    except auth.EmailAlreadyExistsError:
        user = auth.get_user_by_email(email)
        logger.info("Konto już istnieje: uid=%s email=%s", user.uid, user.email)
        return jsonify({
            "success": True,
            "created": False,
            "message": "Konto z tym adresem już istnieje.",
            "user": user_payload(user),
        }), 200
    except auth.InvalidArgumentError as error:
        logger.exception("Nieprawidłowe dane rejestracji.")
        return jsonify({
            "success": False,
            "code": "invalid-registration",
            "error": str(error),
        }), 400
    except Exception as error:
        logger.exception("Błąd Firebase podczas rejestracji.")
        return jsonify({
            "success": False,
            "code": "firebase-error",
            "error": str(error),
        }), 500


@app.get("/health")
def health():
    return jsonify({"success": True, "firebase": True})


@app.post("/analytics/visit")
def track_visit():
    data = request.get_json(silent=True) or {}
    visitor_id = "".join(
        character
        for character in str(data.get("visitorId", ""))
        if character.isalnum() or character in "-_"
    )[:80]
    if not visitor_id:
        return jsonify({"success": False, "error": "Brak identyfikatora wizyty."}), 400

    visitor = {
        "name": "Gość",
        "email": "",
        "lastSeen": firestore.SERVER_TIMESTAMP,
        "visits": firestore.Increment(1),
    }
    header = request.headers.get("Authorization", "")
    if header.startswith("Bearer "):
        try:
            decoded = auth.verify_id_token(header.removeprefix("Bearer ").strip())
            visitor["name"] = decoded.get("name") or decoded.get("email") or "Użytkownik"
            visitor["email"] = decoded.get("email") or ""
            visitor["uid"] = decoded.get("uid") or ""
        except Exception:
            logger.info("Pominięto nieprawidłowy token przy rejestrowaniu wizyty.")

    database = firestore.client()
    database.collection("site_visitors").document(visitor_id).set(visitor, merge=True)
    database.collection("site_analytics").document("summary").set(
        {"views": firestore.Increment(1), "updatedAt": firestore.SERVER_TIMESTAMP},
        merge=True,
    )
    return jsonify({"success": True}), 201


@app.get("/admin/analytics")
def analytics():
    _, error_response = require_admin()
    if error_response:
        return error_response

    database = firestore.client()
    summary = database.collection("site_analytics").document("summary").get().to_dict() or {}
    visitors = []
    for document in (
        database.collection("site_visitors")
        .order_by("lastSeen", direction=firestore.Query.DESCENDING)
        .limit(50)
        .stream()
    ):
        data = document.to_dict()
        last_seen = data.get("lastSeen")
        visitors.append({
            "id": document.id,
            "name": data.get("name", "Gość"),
            "email": data.get("email", ""),
            "visits": data.get("visits", 0),
            "lastSeen": last_seen.isoformat() if last_seen else "",
        })
    accounts = {}
    guests = []
    for visitor in visitors:
        if visitor["email"]:
            account = accounts.setdefault(visitor["email"], {
                "name": visitor["name"],
                "email": visitor["email"],
                "visits": 0,
                "lastSeen": visitor["lastSeen"],
            })
            account["visits"] += visitor["visits"]
            account["lastSeen"] = max(account["lastSeen"], visitor["lastSeen"])
        else:
            guests.append(visitor)
    return jsonify({
        "success": True,
        "views": summary.get("views", 0),
        "accounts": list(accounts.values()),
        "guests": guests,
    })


@app.get("/posts")
def posts():
    documents = firestore.client().collection("posts").stream()
    result = []
    for document in documents:
        data = document.to_dict()
        result.append({
            "id": document.id,
            "title": data.get("title", ""),
            "content": data.get("content", ""),
            "imageUrl": data.get("imageUrl", ""),
            "authorName": data.get("authorName", ""),
            "authorEmail": data.get("authorEmail", ""),
            "authorRole": data.get("authorRole", "Twórca"),
        })
    return jsonify({"success": True, "posts": result})


@app.get("/notifications")
def notifications():
    documents = (
        firestore.client()
        .collection("notifications")
        .order_by("createdAt", direction=firestore.Query.DESCENDING)
        .limit(20)
        .stream()
    )
    result = []
    for document in documents:
        data = document.to_dict()
        result.append({
            "id": document.id,
            "title": data.get("title", ""),
            "message": data.get("message", ""),
        })
    return jsonify({"success": True, "notifications": result})


if __name__ == "__main__":
    initialize_firebase()
    logger.info("Serwer Flask działa na http://127.0.0.1:5000")
    app.run(host="127.0.0.1", port=5000, debug=True)
