# Strona Sylwii

## Wdrożenie API na Render

1. Wgraj zmiany do GitHub.
2. W Render wybierz **New** > **Blueprint** i wskaż to repozytorium. Render odczyta plik `render.yaml`.
3. W utworzonej usłudze otwórz **Environment** > **Secret Files** i dodaj plik:

   ```text
   /etc/secrets/firebase-service-account.json
   ```

   Jako zawartość wklej nowy klucz konta usługi Firebase.
4. W zmiennej `FIREBASE_SERVICE_ACCOUNT` wpisz:

   ```text
   /etc/secrets/firebase-service-account.json
   ```

5. W Render otwórz **Settings** > **Custom Domains** i dodaj:

   ```text
   api.sylwiaszyja.pl
   ```

6. W panelu DNS domeny dodaj rekord CNAME zgodny z instrukcją podaną przez Render dla `api`.
7. Po aktywowaniu domeny wykonaj **Manual Deploy** i otwórz:

   ```text
   https://api.sylwiaszyja.pl/notifications
   ```

   Odpowiedź z `success: true` oznacza, że API działa.

## Powiadomienia

Powiadomienia wymagają działającego API pod `https://api.sylwiaszyja.pl`.
Jeżeli adres nie otwiera się lub nie zwraca JSON-a z `success: true`, strona nie
może ani zapisać powiadomienia z panelu administratora, ani wyświetlić go pod
ikoną dzwonka.

Po wdrożeniu sprawdź kolejno:

1. `https://api.sylwiaszyja.pl/health` — powinno zwrócić `{"success": true, "firebase": true}`.
2. `https://api.sylwiaszyja.pl/notifications` — powinno zwrócić obiekt z tablicą `notifications`.
3. Zaloguj się kontem administratora, dodaj plan publikacji i odśwież stronę w
   drugiej przeglądarce. Dzwonek powinien pokazać liczbę nowych wiadomości.

Klucz Firebase nie może trafić do repozytorium. Jeżeli używany klucz był kiedykolwiek publicznie dostępny, unieważnij go w Firebase Console i utwórz nowy.
