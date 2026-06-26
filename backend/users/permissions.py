from rest_framework.permissions import BasePermission


# -------------------------
# Admin
# -------------------------
class IsAdmin(BasePermission):

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and request.user.role == "admin"
        )


# -------------------------
# Patient
# -------------------------
class IsPatient(BasePermission):

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and request.user.role == "patient"
        )


# -------------------------
# Medecin
# -------------------------
class IsMedecin(BasePermission):

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and request.user.role == "medecin"
        )


# -------------------------
# Admin ou Medecin
# -------------------------
class IsAdminOrMedecin(BasePermission):

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and request.user.role in ["admin", "medecin"]
        )


# -------------------------
# Admin ou Patient
# -------------------------
class IsAdminOrPatient(BasePermission):

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and request.user.role in ["admin", "patient"]
        )


# -------------------------
# Tout utilisateur connecté
# -------------------------
class IsAuthenticatedUser(BasePermission):

    def has_permission(self, request, view):
        return request.user.is_authenticated