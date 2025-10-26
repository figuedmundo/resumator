# Invalidate JWT on logout

The `POST /api/v1/auth/logout` endpoint is not invalidating the JWT on the server side. This means that the token can still be used to access protected endpoints even after the user has logged out. This should be fixed by adding the token to a blacklist when the user logs out.