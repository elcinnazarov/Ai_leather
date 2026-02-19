package com.aiatelye.leather.repository;

import com.aiatelye.leather.dao.LeatherGrade;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface LeatherGradeRepository extends JpaRepository<LeatherGrade, Long> {

    @EntityGraph(attributePaths = {"leathers"})
    Optional<LeatherGrade> findById(Long id);
}
