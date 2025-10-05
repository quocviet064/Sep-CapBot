import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { XMarkIcon, BellAlertIcon } from "@heroicons/react/24/outline";

type Props = {
  open: boolean;
  onClose: () => void;
  notification?: any | null;
  autoMarkRead?: boolean;
};

export default function NotificationDetailModal({ open, onClose, notification }: Props) {
  if (!notification) return null;

  const { title, message, createdAt } = notification;
  const formattedDate =
    createdAt && !isNaN(new Date(createdAt).getTime())
      ? format(new Date(createdAt), "PPpp", { locale: vi })
      : "Không rõ thời gian";

  return (
    <Transition show={open} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        {/* Overlay */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
        </Transition.Child>

        {/* Modal container */}
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0 translate-y-2 scale-95"
            enterTo="opacity-100 translate-y-0 scale-100"
            leave="ease-in duration-150"
            leaveFrom="opacity-100 translate-y-0 scale-100"
            leaveTo="opacity-0 translate-y-2 scale-95"
          >
            <Dialog.Panel className="w-full max-w-xl rounded-2xl bg-white shadow-xl ring-1 ring-slate-900/5 overflow-hidden">
              {/* Header */}
              <div className="flex items-start gap-4 p-5 border-b">
                <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-rose-50 text-rose-600">
                  <BellAlertIcon className="w-6 h-6" />
                </div>

                <div className="flex-1 min-w-0">
                  <Dialog.Title className="text-lg font-semibold text-slate-900 leading-tight">
                    {title ?? "Thông báo"}
                  </Dialog.Title>
                  <div className="text-xs text-slate-500 mt-1">{formattedDate}</div>
                </div>
              </div>

              {/* Body */}
              <div className="p-6">
                <div className="prose prose-sm max-w-none text-slate-800">
                  {message ? (
                    <div style={{ whiteSpace: "pre-wrap" }}>{message}</div>
                  ) : (
                    <div className="text-slate-500">Không có nội dung chi tiết.</div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-3 p-4 border-t bg-slate-50">
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-100"
                >
                  Đóng
                </button>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}
