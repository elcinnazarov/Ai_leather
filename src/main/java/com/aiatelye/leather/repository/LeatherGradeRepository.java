package com.aiatelye.leather.repository;

import com.aiatelye.leather.dao.LeatherGrade;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LeatherGradeRepository extends JpaRepository<LeatherGrade, Long> {
}
