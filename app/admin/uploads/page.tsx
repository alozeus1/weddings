import { AdminUploads } from "@/components/upload/admin-uploads";
import { headers } from "next/headers";

export default async function AdminUploadsPage(): Promise<React.JSX.Element> {
  const password = process.env.ADMIN_UPLOAD_PASSWORD || "";
  const authorization = (await headers()).get("authorization") || "";
  const isAuthorized = authorization.startsWith("Basic ")
    ? Buffer.from(authorization.slice(6), "base64").toString("utf-8").split(":")[1] === password
    : false;

  if (!password) {
    return (
      <section className="container-shell py-16">
        <h1 className="font-display text-4xl">Admin Uploads</h1>
        <p className="mt-3 text-sm text-ink/70">Set ADMIN_UPLOAD_PASSWORD to enable moderation.</p>
      </section>
    );
  }

  if (!isAuthorized) {
    return (
      <section className="container-shell py-16">
        <h1 className="font-display text-4xl">Unauthorized</h1>
        <p className="mt-3 text-sm text-ink/70">Use HTTP Basic Auth to access this route.</p>
      </section>
    );
  }

  return (
    <section className="container-shell space-y-6 py-16">
      <h1 className="font-display text-4xl">Upload Moderation</h1>
      <AdminUploads adminPassword={password} />
    </section>
  );
}
