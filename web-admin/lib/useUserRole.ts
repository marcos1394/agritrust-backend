"use client";
import { useUser } from "@clerk/nextjs";

export const useUserRole = () => {
  const { user } = useUser();
  // Leemos la metadata pública que configuraste en Clerk
  const role = user?.publicMetadata?.role as string | undefined;
  
  return {
    role,
    isAdmin: role === 'admin',
    isOperator: role === 'operator',
    loading: !user
  };
};