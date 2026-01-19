package com.thejoa703.domain;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "DEPTUSER")   // ✅ 새로운 테이블 이름 지정
public class DeptUser {

    @Id
    private Long deptno;
    private String dname;
    private String loc;

    // Getter/Setter
    public Long getDeptno() { return deptno; }
    public void setDeptno(Long deptno) { this.deptno = deptno; }

    public String getDname() { return dname; }
    public void setDname(String dname) { this.dname = dname; }

    public String getLoc() { return loc; }
    public void setLoc(String loc) { this.loc = loc; }
}
