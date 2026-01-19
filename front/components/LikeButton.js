// ✅ 필요한 라이브러리 import
import { Button, Spin } from "antd";
import { HeartOutlined, HeartFilled } from "@ant-design/icons";

export default function LikeButton({
  postId,
  user,
  liked,          // ✅ 변경: 불리언 값으로 전달
  likes,          // ✅ 변경: 좋아요 수
  onToggleLike,
  loading,
}) {
  // 로그인 여부 체크
  const isDisabled = !user || loading;

  return (
    <div style={{ textAlign: "center" }}>
      <Button
        type="text"
        onClick={() => onToggleLike(postId)} // ✅ 변경: 불리언 기반 토글 핸들러
      >
        {loading ? (
          <Spin size="small" />
        ) : liked ? ( // ✅ 변경: liked 불리언 값으로 체크
          <HeartFilled style={{ fontSize: "20px", color: "red" }} />
        ) : (
          <HeartOutlined style={{ fontSize: "20px", color: "#555" }} />
        )}
        <div style={{ fontSize: "12px" }}>
          좋아요 {likes ?? 0} {/* ✅ 변경: likesCount[postId] 값 전달 */}
        </div>
      </Button>
    </div>
  );
}
