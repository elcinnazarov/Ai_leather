package com.aiatelye.leather.service.catalog;

import com.aiatelye.leather.dto.RequestCreatLeather;
import com.aiatelye.leather.dto.ResponseLeather;
import org.springframework.web.multipart.MultipartFile;

public interface LeatherService {

   ResponseLeather createLeather(RequestCreatLeather request, MultipartFile image);
}
