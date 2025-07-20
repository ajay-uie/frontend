import requests
import json
import os

# Load environment variables
API_BASE = os.getenv("API_BASE", "https://backend-8npy.onrender.com")

# Dummy token (use valid one if needed)
AUTH_HEADER = {
    "Authorization": "Bearer dummy_token"
}

# Dummy data for POST/PUT/PATCH requests
DUMMY_BODY = {
    "email": "test@example.com",
    "password": "123456"
}

# API routes copied from frontend structure
API_ENDPOINTS = {
    "auth": {
        "register": "/auth/register",
        "login": "/auth/login",
        "googleLogin": "/auth/google-login",
        "loginToken": "/auth/login-token",
        "verify": "/auth/verify",
        "logout": "/auth/logout",
        "forgotPassword": "/auth/forgot-password",
        "adminLogin": "/admin/auth/login",
        "adminProfile": "/admin/auth/profile",
        "adminVerify": "/admin/auth/verify",
        "adminLogout": "/admin/auth/logout",
        "adminRefresh": "/admin/auth/refresh",
    },
    "products": {
        "list": "/products",
        "detail": "/products/sample-id",
        "create": "/products",
        "update": "/products/sample-id",
        "delete": "/products/sample-id",
    },
    "orders": {
        "create": "/orders/create",
        "detail": "/orders/sample-id",
        "userOrders": "/orders/user",
        "updateStatus": "/admin/orders/sample-id/status",
    },
    "payments": {
        "verify": "/payments/verify",
    },
    "coupons": {
        "apply": "/coupons/apply",
        "public": "/coupons/public",
    },
    "users": {
        "profile": "/users/profile",
        "addresses": "/users/addresses",
    },
    "admin": {
        "dashboard": "/admin/dashboard",
        "countdownSettings": "/admin/countdown-settings",
        "analytics": "/admin/analytics",
        "signals": "/admin/signals",
    },
    "health": "/health"
}

# Methods to try for each route (you can customize)
METHOD_MAP = {
    "create": "POST",
    "register": "POST",
    "login": "POST",
    "logout": "POST",
    "verify": "POST",
    "apply": "POST",
    "detail": "GET",
    "list": "GET",
    "public": "GET",
    "profile": "GET",
    "addresses": "GET",
    "dashboard": "GET",
    "analytics": "GET",
    "signals": "GET",
    "update": "PATCH",
    "delete": "DELETE",
    "updateStatus": "PATCH",
    "forgotPassword": "POST",
    "loginToken": "POST",
    "adminLogin": "POST",
    "adminProfile": "GET",
    "adminVerify": "GET",
    "adminLogout": "POST",
    "adminRefresh": "POST",
    "countdownSettings": "GET",
    "health": "GET"
}


def flatten_routes(data):
    flat = {}
    for key, value in data.items():
        if isinstance(value, dict):
            for subkey, subval in value.items():
                name = f"{key}.{subkey}"
                flat[name] = subval
        else:
            flat[key] = value
    return flat


def test_route(method, path):
    url = f"{API_BASE}{path}"
    try:
        if method == "GET":
            r = requests.get(url, headers=AUTH_HEADER)
        elif method == "POST":
            r = requests.post(url, json=DUMMY_BODY, headers=AUTH_HEADER)
        elif method == "PATCH":
            r = requests.patch(url, json=DUMMY_BODY, headers=AUTH_HEADER)
        elif method == "DELETE":
            r = requests.delete(url, headers=AUTH_HEADER)
        else:
            r = requests.request(method, url, headers=AUTH_HEADER)

        if r.status_code == 200:
            print(f"✅ 200 OK: {method} {path}")
        elif r.status_code == 401:
            print(f"⚠️  401 Unauthorized: {method} {path}")
        elif r.status_code == 400:
            print(f"⚠️  400 Bad Request: {method} {path}")
        elif r.status_code == 500:
            print(f"⚠️  500 Server Error: {method} {path}")
        else:
            print(f"❌ {r.status_code}: {method} {path}")
    except Exception as e:
        print(f"❌ ERROR: {method} {path} — {e}")


def main():
    print(f"🔍 Verifying routes against {API_BASE}\n")
    routes = flatten_routes(API_ENDPOINTS)
    for name, path in routes.items():
        method = METHOD_MAP.get(name.split(".")[-1], "GET")
        test_route(method, path)


if __name__ == "__main__":
    main()