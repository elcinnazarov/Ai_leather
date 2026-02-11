package com.aiatelye.leather.service.catalog;

import com.aiatelye.leather.dto.CreatLeatherRequest;
import com.aiatelye.leather.dto.LeatherResponse;
import org.springframework.web.multipart.MultipartFile;

public interface LeatherService {

   LeatherResponse createLeather(CreatLeatherRequest request, MultipartFile image);
}
