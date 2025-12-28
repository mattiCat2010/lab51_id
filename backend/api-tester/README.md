Lab51 API Tester ~ WARNING: AI GENERATED
=================

A small static UI to test the backend API without writing JSON by hand.

Quickstart
----------
1. Make sure your backend server is running (default: http://localhost:4035).
2. Open the tester in your browser at:

   http://localhost:4035/api-tester/

   (The tester is served by the backend so requests are same-origin and avoid CORS issues.)

Features
--------
- Login to get a temporary token (saved in localStorage)
- Create user (friendly form for name/email/password/departments/highestLevel)
- Update user (change selected fields and add/update/remove departments using level 0 to remove)
- Get a user summary by pubid (GET)
- Get full user data (POST to `/humans/get-user/` with auth)
- Raw request mode to call any endpoint and view status + JSON response

Notes
-----
- For non-GET requests, the tester auto-injects `pubid` and `token` into the JSON body when stored (unless you uncheck "Auto include saved auth").
- To remove a department set its level to `0` in the departments list, e.g. `chemistry.0`.

Security
--------
- The tester stores only the temporary token and pubid in `localStorage` for convenience. Do NOT use in a public environment.
