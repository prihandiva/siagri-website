import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db as prisma } from "@/lib/db";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null;

        const user = await prisma.sys_user.findFirst({
          where: {
            username: credentials.username as string,
            is_deleted: false,
            status: "AKTIF",
          },
          include: {
            role: true,
            desa: {
              include: {
                kecamatan: {
                  include: {
                    kabupaten: {
                      include: { provinsi: true },
                    },
                  },
                },
              },
            },
          },
        });

        if (!user) return null;

        const passwordValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!passwordValid) return null;

        // Update last login
        await prisma.sys_user.update({
          where: { id_user: user.id_user },
          data: { last_login: new Date() },
        });

        return {
          id: String(user.id_user),
          name: user.nama_lengkap,
          email: user.email,
          role: user.role.kode_role,
          roleName: user.role.nama_role,
          level: 1, // Fallback level since no level on sys_role
          idDesa: user.id_desa ? String(user.id_desa) : null,
          namaDesa: user.desa?.nama_desa ?? null,
          namaKecamatan: user.desa?.kecamatan?.nama_kecamatan ?? null,
          namaKabupaten: user.desa?.kecamatan?.kabupaten?.nama_kabupaten ?? null,
          namaProvinsi: user.desa?.kecamatan?.kabupaten?.provinsi?.nama_provinsi ?? null,
          nik: user.nik ?? null,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.roleName = (user as any).roleName;
        token.level = (user as any).level;
        token.idDesa = (user as any).idDesa;
        token.namaDesa = (user as any).namaDesa;
        token.namaKecamatan = (user as any).namaKecamatan;
        token.namaKabupaten = (user as any).namaKabupaten;
        token.namaProvinsi = (user as any).namaProvinsi;
        token.nik = (user as any).nik;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id as string;
      (session.user as any).role = token.role;
      (session.user as any).roleName = token.roleName;
      (session.user as any).level = token.level;
      (session.user as any).idDesa = token.idDesa;
      (session.user as any).namaDesa = token.namaDesa;
      (session.user as any).namaKecamatan = token.namaKecamatan;
      (session.user as any).namaKabupaten = token.namaKabupaten;
      (session.user as any).namaProvinsi = token.namaProvinsi;
      (session.user as any).nik = token.nik;
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 8 * 60 * 60, // 8 jam
  },
});
