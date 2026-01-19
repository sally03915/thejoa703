// ✅ React 훅과 Redux 훅 import
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Input, Button, List } from "antd";

// ✅ reducer 액션 import
import {
  fetchCommentsRequest,
  createCommentRequest,
  updateCommentRequest,
  deleteCommentRequest,
} from "../reducers/commentReducer";

export default function CommentSection({ postId, user }) {
  const dispatch = useDispatch();

  // ✅ 변경: postId별 댓글 가져오기
  const comments = useSelector((state) => state.comment.comments[postId] || []);
  const loading = useSelector((state) => state.comment.loading);

  // ✅ 로컬 상태 관리
  const [newContent, setNewContent] = useState(""); // 새 댓글 입력 상태
  const [editId, setEditId] = useState(null);       // 수정 중인 댓글 ID
  const [editContent, setEditContent] = useState(""); // 수정 중인 댓글 내용

  // ✅ 댓글 조회 (컴포넌트 마운트 시 실행)
  useEffect(() => {
    dispatch(fetchCommentsRequest({ postId })); // ✅ 변경: postId 포함
  }, [dispatch, postId]);

  // ✅ 댓글 작성
  const handleCreate = () => {
    if (!newContent.trim()) return;
    dispatch(createCommentRequest({ postId, dto: { content: newContent } })); // ✅ 변경
    setNewContent("");
  };

  // ✅ 댓글 수정
  const handleUpdate = (commentId) => {
    if (!editContent.trim()) return;
    dispatch(updateCommentRequest({ postId, commentId, dto: { content: editContent } })); // ✅ 변경
    setEditId(null);
    setEditContent("");
  };

  // ✅ 댓글 삭제
  const handleDelete = (commentId) => {
    dispatch(deleteCommentRequest({ postId, commentId })); // ✅ 변경
  };

  return (
    <div
      style={{
        marginTop: "15px",
        padding: "10px",
        backgroundColor: "#fafafa",
        borderRadius: "6px",
      }}
    >
      <strong>댓글</strong>

      {/* ✅ 댓글 작성 입력창 */}
      {user && (
        <div style={{ marginTop: "10px" }}>
          <Input.TextArea
            rows={2}
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            placeholder="댓글을 입력하세요"
          />
          <Button type="primary" onClick={handleCreate} style={{ marginTop: "5px" }}>
            등록
          </Button>
        </div>
      )}

      {/* ✅ 댓글 목록 */}
      <List
        style={{ marginTop: "10px" }}
        loading={loading}
        dataSource={comments}
        renderItem={(c) => (
          <List.Item
            actions={
              user && user.nickname === c.authorNickname
                ? [
                    editId === c.id ? (
                      <Button onClick={() => handleUpdate(c.id)}>저장</Button>
                    ) : (
                      <Button
                        onClick={() => {
                          setEditId(c.id);
                          setEditContent(c.content);
                        }}
                      >
                        수정
                      </Button>
                    ),
                    <Button danger onClick={() => handleDelete(c.id)}>삭제</Button>,
                  ]
                : []
            }
          >
            {/* ✅ 수정 모드일 때와 일반 모드 구분 */}
            {editId === c.id ? (
              <Input.TextArea
                rows={2}
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
              />
            ) : (
              <div>
                <strong>{c.authorNickname}</strong>: {c.content}
                <div style={{ fontSize: "12px", color: "#888" }}>
                  {new Date(c.createdAt).toLocaleString()}
                </div>
              </div>
            )}
          </List.Item>
        )}
      />
    </div>
  );
}
