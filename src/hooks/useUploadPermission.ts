import { useState, useEffect } from "react";

export function useUploadPermission(userId: string, userRole: string) {
  const [userHasUploadPermission, setUserHasUploadPermission] = useState(false);

  useEffect(() => {
    const checkPermission = async () => {
      if (
        userRole === "ADMIN" ||
        userRole === "MANAGEMENT" ||
        userRole === "TEACHER"
      ) {
        setUserHasUploadPermission(true);
        return;
      }
      try {
        const res = await fetch("/api/settings/profile");
        const data = await res.json();
        if (data.success && data.user?.uploadPermissions?.length > 0) {
          setUserHasUploadPermission(true);
        }
      } catch {
        setUserHasUploadPermission(false);
      }
    };
    if (userId) checkPermission();
  }, [userId, userRole]);

  const canPublish = userHasUploadPermission;
  const canManagePermissions =
    userRole === "ADMIN" || userRole === "MANAGEMENT";

  return { canPublish, canManagePermissions };
}
