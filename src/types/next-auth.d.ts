import NextAuth, { DefaultSession, DefaultUser } from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  /**
   * Augmented User object returned by the `authorize` callback
   * and available in JWT/session callbacks.
   */
  interface User extends DefaultUser {
    role?: string;
    roleName?: string;
    level?: number;
    idProvinsi?: string | null;
    idKabupaten?: string | null;
    idKecamatan?: string | null;
    idDesa?: string | null;
    namaDesa?: string | null;
    namaKecamatan?: string | null;
    namaKabupaten?: string | null;
    namaProvinsi?: string | null;
    nik?: string;
  }

  interface Session {
    user: {
      id?: string;
      role?: string;
      roleName?: string;
      level?: number;
      idProvinsi?: string | null;
      idKabupaten?: string | null;
      idKecamatan?: string | null;
      idDesa?: string | null;
      namaDesa?: string | null;
      namaKecamatan?: string | null;
      namaKabupaten?: string | null;
      namaProvinsi?: string | null;
      nik?: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: string;
    roleName?: string;
    level?: number;
    idProvinsi?: string | null;
    idKabupaten?: string | null;
    idKecamatan?: string | null;
    idDesa?: string | null;
    namaDesa?: string | null;
    namaKecamatan?: string | null;
    namaKabupaten?: string | null;
    namaProvinsi?: string | null;
    nik?: string;
  }
}
