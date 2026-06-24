package com.aiatelye.leather.service.admin;

import com.aiatelye.leather.Specification.AdminLeatherSpecification;
import com.aiatelye.leather.dao.Leather;
import com.aiatelye.leather.dto.admin.leather.LeatherFilter;
import com.aiatelye.leather.dto.admin.leather.LeatherResponseAdmin;
import com.aiatelye.leather.dto.defalutResponse.PageResponse;
import com.aiatelye.leather.mapper.LeatherMapper;
import com.aiatelye.leather.repository.LeatherRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminLeatherService {
    private final LeatherRepository leatherRepository;
    private final LeatherMapper leatherMapper;

    /**
     * Admin bütün leather-ləri görür:
     * - isActive=false olanlar da (default false)
     * - availabilityStatus=DRAFT olanlar da (default DRAFT)
     * - Bütün statuslar
     */
    @Transactional(readOnly = true)
    public PageResponse<LeatherResponseAdmin> getLeathers(LeatherFilter filter, Pageable pageable) {
        log.info("Admin fetching ALL leathers (including inactive/draft) with filter: {}", filter);

        // Admin filter: HEÇ BİR status məhdudiyyəti YOXDUR
        Specification<Leather> spec = AdminLeatherSpecification.withAdminFilter(filter);

        Page<Leather> leatherPage;
        try {
            leatherPage = leatherRepository.findAll(spec, pageable);
        } catch (Exception e) {
            log.error("Error fetching leathers with specification", e);
            throw new RuntimeException("Could not retrieve leather data");
        }

        List<LeatherResponseAdmin> content = leatherPage.getContent().stream()
                .map(leatherMapper::toResponse)
                .collect(Collectors.toList());

        return PageResponse.<LeatherResponseAdmin>builder()
                .content(content)
                .pageNumber(leatherPage.getNumber())
                .pageSize(leatherPage.getSize())
                .totalElements(leatherPage.getTotalElements())
                .totalPages(leatherPage.getTotalPages())
                .last(leatherPage.isLast())
                .build();
    }

    @Transactional(readOnly = true)
    public LeatherResponseAdmin getLeatherById(Long id) {
        Leather leather = leatherRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Leather not found with id: " + id));
        return leatherMapper.toResponse(leather);
    }

}
