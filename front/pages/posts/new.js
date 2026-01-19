import { Card, Form, Input, Button, Upload, message, Select } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { createPostRequest } from "../../reducers/postReducer";
import { useState } from "react";
import { useRouter } from "next/router";

export default function NewPostPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const { loading, error } = useSelector((s) => s.post);
  const [fileList, setFileList] = useState([]);

  if (!user) return <Card>로그인이 필요합니다.</Card>;

  const onFinish = (values) => {
    const dto = {
      content: values.content,
      hashtags: values.hashtags ? values.hashtags.join(",") : "",
    };
    const files = fileList.map((f) => f.originFileObj);
    dispatch(createPostRequest({ dto, files }));
    message.success("게시글 작성 요청 완료");
    setFileList([]);
    router.push("/");
  };

  return (
    <Card title="게시글 작성" style={{ maxWidth: 600, margin: "0 auto" }}>
      <Form layout="vertical" onFinish={onFinish}>
        <Form.Item
          label="내용"
          name="content"
          rules={[{ required: true, message: "내용을 입력하세요" }]}
        >
          <Input.TextArea rows={4} placeholder="게시글 내용을 입력하세요" />
        </Form.Item>

        <Form.Item label="해시태그" name="hashtags">
          <Select mode="tags" style={{ width: "100%" }} placeholder="해시태그 입력 후 Enter" />
        </Form.Item>

        <Form.Item label="이미지 업로드">
          <Upload
            multiple
            beforeUpload={() => false}
            fileList={fileList}
            onChange={({ fileList }) => setFileList(fileList)}
            listType="picture-card"
          >
            <Button icon={<UploadOutlined />}>이미지 선택</Button>
          </Upload>
        </Form.Item>

        <Button type="primary" htmlType="submit" loading={loading}>
          게시글 작성
        </Button>
        {error && <p style={{ color: "red" }}>{error}</p>}
      </Form>
    </Card>
  );
}
