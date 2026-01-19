import { Layout, Menu, Input, Row, Col, Drawer, Button, Grid } from "antd";
import { MenuOutlined, SearchOutlined } from "@ant-design/icons";
import Link from "next/link";
import { useSelector, useDispatch } from "react-redux";
import axios from "../api/axios";
import { logout, loginSuccess } from "../reducers/authReducer";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

const { Header, Content } = Layout;
const { useBreakpoint } = Grid;

function AppLayout({ children, initialUser }) {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const router = useRouter();
  const screens = useBreakpoint();
  const [drawerOpen, setDrawerOpen] = useState(false);

  // ✅ 검색 입력 상태 추가
  const [searchValue, setSearchValue] = useState("");

  useEffect(() => {
    if (initialUser && !user && initialUser.nickname) {
      dispatch(loginSuccess({ user: initialUser }));
    }
  }, [initialUser, user, dispatch]);

  const protectedRoutes = ["/mypage", "/followers", "/followings"];

  useEffect(() => {
    if (!user && !initialUser && protectedRoutes.includes(router.pathname)) {
      axios.get("/auth/me")
        .then((res) => {
          if (res.data && res.data.nickname) {
            dispatch(loginSuccess({ user: res.data }));
          } else {
            dispatch(logout());
            router.replace("/login");
          }
        })
        .catch(() => {
          dispatch(logout());
          router.replace("/login");
        });
    }
  }, [user, initialUser, dispatch, router.pathname]);

  const handleLogout = async () => {
    try {
      await axios.post("/auth/logout");
      if (typeof window !== "undefined") {
        localStorage.removeItem("accessToken");
      }
      dispatch(logout());
      router.push("/login");
    } catch (err) {
      console.error("로그아웃 실패:", err);
      dispatch(logout());
      router.push("/login");
    }
  };

  // ✅ 검색 실행 후 입력값 초기화
  const onSearch = (value) => {
    if (value) {
      router.push(`/hashtags?tag=${encodeURIComponent(value)}`);
      setSearchValue(""); // ✅ 검색 후 입력창 비우기
    }
  };

  const menuItems = [
    ...(user && user.nickname
      ? [
          { key: "new", label:     <Link href="/posts/new">✏️ NEW POST</Link> },
          { key: "profile", label: <Link href="/mypage">👤 MYPAGE </Link> },
          {
            key: "logout",
            label: (
              <a onClick={handleLogout} style={{ cursor: "pointer" }}>
               🔓 LOGOUT
              </a>
            ),
          },
        ]
      : [
          { key: "login", label: <Link href="/login">🔒Login</Link> },
          { key: "signup", label: <Link href="/signup">🆕👤Signup</Link> },
        ]),
  ];

  return (
    <Layout>
      {/* Header */}
      <Header style={{ padding: "0 24px", height: 64, display: "flex", alignItems: "center" }}>
        <Row align="middle" justify="space-between" style={{ width: "100%" }}>
          {/* ✅ 로고 클릭 시 홈으로 이동 */}
          <Col flex="none">
            <Link href="/" passHref legacyBehavior>
              <a style={{ color: "#fff", fontWeight: "bold", fontSize: "18px", marginLeft: "12px", textDecoration: "none" }}>
                THEJOA703
              </a>
            </Link>
          </Col> 

          {/* 메뉴 (PC에서 항상 표시, ... 제거) */}
          <Col flex="auto" xs={0} sm={0} md={16} lg={18}>
            <Menu
              theme="dark"
              mode="horizontal"
              items={menuItems}
              overflowedIndicator={null} // ✅ ... 제거
            />
          </Col>

          {/* 햄버거 버튼 (모바일만 표시) */}
          <Col flex="none" xs={2} md={0}>
            <Button
              type="text"
              icon={<MenuOutlined style={{ color: "white", fontSize: 20 }} />}
              onClick={() => setDrawerOpen(true)}
            />
          </Col>
        </Row>
      </Header>

      {/* 검색창 (PC에서만 표시, 중앙 정렬) */}
      {screens.md && (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: "16px", background: "#fafafa", borderBottom: "1px solid #eaeaea" }}>
          <Input
            prefix={<SearchOutlined style={{ color: "#999" }} />}
            placeholder="해시태그 검색 (springboot)"
            value={searchValue} // ✅ 상태 연결
            onChange={(e) => setSearchValue(e.target.value)} // ✅ 입력값 업데이트
            onPressEnter={(e) => onSearch(e.target.value)}
            style={{
              maxWidth: 600,
              width: "100%",
              borderRadius: "20px",
              background: "#fff",
              padding: "6px 12px",
              verticalAlign: "middle"
            }}
          />
        </div>
      )}

      {/* Drawer (모바일 메뉴 + 검색창 포함) */}
      <Drawer
        title="Menu"
        placement="right"
        onClose={() => setDrawerOpen(false)}
        open={drawerOpen}
      >
        <Input.Search
          placeholder="해시태그 검색 (#springboot)"
          enterButton="검색"
          value={searchValue} // ✅ 상태 연결
          onChange={(e) => setSearchValue(e.target.value)} // ✅ 입력값 업데이트
          onSearch={(value) => {
            setDrawerOpen(false);
            onSearch(value);
          }}
          style={{ marginBottom: 16 }}
        />
        <Menu
          mode="vertical"
          items={menuItems}
          onClick={() => setDrawerOpen(false)}
        />
      </Drawer>

      <Content style={{ padding: "40px" }}>{children}</Content>
    </Layout>
  );
}

export default AppLayout;
