import { Suspense, useState } from "react";
import { Button } from "@/components/globals/atoms/button";
import { Users, Shield } from "lucide-react";
import AdminUserCreateDialog from "./admin-user-create-dialog";

export default function AccountProvisionPage() {
  const [openCreate, setOpenCreate] = useState(false);

  return (
    <div className="space-y-4">
      <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-tr from-neutral-900 via-neutral-800 to-neutral-700 p-5 text-white shadow-sm">
        <div className="absolute -top-16 -right-16 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-white/5 blur-2xl" />
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Cấp tài khoản</h2>
              <p className="text-xs text-white/70">
                Admin tạo tài khoản Reviewer, Moderator, Supervisor
              </p>
            </div>
          </div>
          <div className="hidden items-center gap-3 md:flex">
            <div className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-right">
              <div className="text-[10px] tracking-wide text-white/70 uppercase">
                Trạng thái
              </div>
              <div className="text-sm font-semibold">Sẵn sàng</div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col justify-between gap-2 rounded-2xl border bg-white/70 p-3 shadow-sm md:flex-row md:items-center">
        <div className="flex items-center gap-2">
          <Button onClick={() => setOpenCreate(true)} className="gap-2">
            <Users className="h-4 w-4" />
            Tạo tài khoản mới
          </Button>
        </div>
      </div>

      {openCreate && (
        <Suspense fallback={null}>
          <AdminUserCreateDialog
            isOpen={openCreate}
            onClose={() => setOpenCreate(false)}
          />
        </Suspense>
      )}
    </div>
  );
}
