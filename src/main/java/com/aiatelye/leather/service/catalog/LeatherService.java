package com.aiatelye.leather.service.catalog;

import com.aiatelye.leather.dto.admin.leather.CreatLeatherRequest;
import com.aiatelye.leather.dto.admin.leather.LeatherResponse;
import org.springframework.web.multipart.MultipartFile;

public interface LeatherService {

   LeatherResponse createLeather(CreatLeatherRequest request, MultipartFile image);
}
