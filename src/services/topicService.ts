import axiosClient from "@/api/axiosClient";

// Lấy danh sách đề tài
export const getTopics = () =>
  axiosClient.get("/topics");

//cái này Bằng chỉ làm mẫu 1 api thôi nhé 
//Cái này phải mở API của BE chạy rồi ghi vào thôi

