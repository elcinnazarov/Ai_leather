package com.aiatelye.leather.dao;

import jakarta.persistence.*;
import lombok.Data;


import java.time.LocalDateTime;

@Entity
@Table(name = "user_limits")
@Data
public class UserLimit {

    @Id
    private Long id;

    @OneToOne
    @MapsId
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "daily_custom_limit", nullable = false)
    private Integer dailyCustomLimit = 5; // Default 5

    @Column(name = "used_today_count", nullable = false)
    private Integer usedTodayCount = 0;

    @Column(name = "last_reset_date")
    private LocalDateTime lastResetDate;

    @Column(name = "daily_standard_limit", nullable = false)
    private Integer dailyStandardLimit = 100; // Default 100

    @Column(name = "used_standard_today", nullable = false)
    private Integer usedStandardToday = 0;

    @Version
    private Long version; // Optimistic locking
}
