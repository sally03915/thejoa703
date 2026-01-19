package com.thejoa703;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class BackApplication {

	public static void main(String[] args) {
		SpringApplication.run(BackApplication.class, args);
	}

}
/*
> 
http://localhost:8484/swagger-ui/index.html
> Redis 키고

docker --version
docker ps
docker pull redis
docker run -d --name my-redis -p 6379:6379 redis

docker exec -it my-redis          redis-cli
docker exec -it my-redis          redis-cli FLUSHALL

keys *

 Swagger UI에서 **회원가입 → 로그인 → 사용자 기능 → 게시글 → 댓글 → 좋아요/리트윗 → 해시태그 검색 → 회원탈퇴** 

*/