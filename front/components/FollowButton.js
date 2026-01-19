// ✅ 필요한 라이브러리 import
import React from "react";
import { Button, message } from "antd";
import { UserAddOutlined, UserDeleteOutlined } from "@ant-design/icons";

/**
 * ✅ FollowButton 컴포넌트
 * - 팔로우/언팔로우 토글 버튼
 * - 자기 자신 팔로우 방어, 로그인 방어, 로딩 방어 포함
 * - followingsMap 기반으로 팔로우 여부 전달
 * - 버튼 스타일 개선: 팔로우=파란색, 언팔로우=빨간색(danger)
 */
export default function FollowButton({
  authorId,
  user,
  isFollowing,
  isBlocked,        // ✅ 추가: 차단 여부 전달
  onToggleFollow,
  onUnblock,        // ✅ 추가: 차단 해제 핸들러
  loading,
}) {
  const handleClick = () => {
    if (!user) {
      message.info("로그인한 사용자만 팔로우할 수 있습니다.");
      window.location.href = "/login";
      return;
    }
    if (!authorId) {
      message.error("팔로우 대상 ID가 없습니다.");
      return;
    }
    if (authorId === user.id) {
      message.warning("자기 자신은 팔로우할 수 없습니다.");
      return;
    }
    if (loading) return;

    if (isBlocked) {
      message.warning("차단을 해제해야 팔로우할 수 있습니다.");
      if (typeof onUnblock === "function") {
        onUnblock(authorId);
      }
      return;
    }

    if (typeof onToggleFollow === "function") {
      onToggleFollow(authorId);
    }
  };

  return (
    <Button
      type={isBlocked ? "default" : isFollowing ? "default" : "primary"}
      danger={isFollowing}
      icon={isBlocked ? null : isFollowing ? <UserDeleteOutlined /> : <UserAddOutlined />}
      loading={loading}
      onClick={handleClick}
      style={{ borderRadius: "6px" }}
      disabled={isBlocked} // ✅ 차단 상태일 때 비활성화 가능
    >
      {isBlocked ? "차단 해제" : isFollowing ? "언팔로우" : "팔로우"}
    </Button>
  );
}

