"use client"
import { MessageBox } from "@/components/messagebox";
import { toast } from "sonner";
export default function Home() {
  return (
    <>
      <h1>Welcome to the Home Page</h1>
      <MessageBox
        trigger={<button>Chào mừng</button>}
        title="Bạn có muốn hiển thị thông báo này không?"
        description="Đây là một hộp thoại cảnh báo mẫu. Và hiển thị sooner"
        actionLabel="Hiển thị"
        cancelLabel="Cancel"
        onConfirm={() => {
          toast.success("Event has been created");
        }}
      />
      <button
        onClick={() => { toast.success("Hello from Sonner!") }}
      >
        Show Toast
      </button>
    </>

  )
}
