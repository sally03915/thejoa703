// ✅ 수정/삭제 버튼 컴포넌트
import { Col } from "antd"; 
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";

export default function EditDeleteButtons({ post, user, onEdit, dispatch, deletePostRequest }) {
  // ✅ 작성자 본인인지 확인 (닉네임 비교)
  const isAuthor =
    user?.nickname?.trim().toLowerCase() ===
    post.authorNickname?.trim().toLowerCase();

  // ✅ 작성자가 아니면 버튼을 표시하지 않음
  if (!isAuthor) return null;

  return (
    <>
      {/* ✅ 수정 버튼 */}
      <Col flex={1} style={{ textAlign: "center" }}> {/* 중앙정렬 */}
        <div
          onClick={() => onEdit(post)}               // 클릭 시 글 수정 모달 열기
          style={{ cursor: "pointer" }}              // 마우스 올리면 손 모양
        >
          <EditOutlined style={{ fontSize: "20px", color: "#555" }} /> 
          <div style={{ fontSize: "12px" }}>수정</div> {/* 아이콘 아래 텍스트 */}
        </div>
      </Col>

      {/* ✅ 삭제 버튼 */}
      <Col flex={1} style={{ textAlign: "center" }}> {/* 중앙정렬 */}
        <div
          onClick={() => dispatch(deletePostRequest({ postId: post.id }))} // 클릭 시 삭제 액션 dispatch
          style={{ cursor: "pointer" }}                                   // 마우스 올리면 손 모양
        >
          <DeleteOutlined style={{ fontSize: "20px", color: "red" }} />
          <div style={{ fontSize: "12px" }}>삭제</div> {/* 아이콘 아래 텍스트 */}
        </div>
      </Col>
    </>
  );
}
