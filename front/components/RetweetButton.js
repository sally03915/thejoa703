// ✅ 필요한 라이브러리 import
import React from "react";
import { RetweetOutlined } from "@ant-design/icons"; // Ant Design 리트윗 아이콘
import { Spin, message } from "antd";

/**
 * RetweetButton 컴포넌트
 * - 리트윗/리트윗 취소 토글 실행
 * - 로딩 상태 반영
 * - 로그인하지 않은 경우 메시지 띄우고 로그인 페이지로 이동
 */
export default function RetweetButton({
  postId,
  user,
  isRetweeted,      // 내가 해당 글을 리트윗했는지 여부s
  retweetCount,     // 리트윗 수
  onToggleRetweet,  // 리트윗/취소 핸들러 (dispatch 실행)
  loading,
}) {
  const handleClick = () => {
    if (!user) {
      message.error("로그인한 사용자만 리트윗할 수 있습니다.");
      window.location.href = "/login";
      return;
    }
    if (loading) return;
    onToggleRetweet(postId, isRetweeted);
  };

  return (
    <div
      onClick={handleClick}
      style={{  
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      {loading ? (
        <Spin size="small" />
      ) : (
        <RetweetOutlined
          style={{
            fontSize: "20px",
            color: isRetweeted ? "green" : "#555",
          }}
        />
      )}
      <div style={{ fontSize: "12px", marginTop: "4px" }}>
        리트윗 {retweetCount || 0}
      </div>
    </div>
  );
}
