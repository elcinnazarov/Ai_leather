package com.aiatelye.leather.controller.Sitemap;


import com.aiatelye.leather.repository.LeatherRepository;
import com.aiatelye.leather.repository.ProductModelRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
/**
 * Sitemap-i əl ilə yazmaq əvəzinə, bazadakı REAL aktiv məhsullardan
 * avtomatik generasiya edir. Yeni məhsul əlavə etdikcə/sildikcə
 * heç bir fayl dəyişməyə ehtiyac qalmır.
 *
 * DİQQƏT: bu endpoint /api/sitemap.xml yolundadır (/sitemap.xml YOX),
 * çünki nginx artıq /api/* -ı bu backend-ə proksi edir. Brauzerin
 * gördüyü https://e1000leather.com/sitemap.xml ünvanını buraya
 * yönləndirmək üçün nginx-ə ayrıca bir location bloku əlavə edilməlidir
 */
@RestController
@RequiredArgsConstructor
public class SitemapController {

    private final ProductModelRepository productModelRepository;
    private final LeatherRepository leatherRepository;

    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ISO_LOCAL_DATE;
    private static final String BASE_URL = "https://e1000leather.com";

    @GetMapping(value = "/api/sitemap.xml", produces = MediaType.APPLICATION_XML_VALUE)
    public ResponseEntity<String> getSitemap() {

        StringBuilder xml = new StringBuilder();
        xml.append("<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n");
        xml.append("<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">\n");

        // --- 1. Əsas statik səhifələr ---
        appendUrl(xml, BASE_URL + "/", LocalDateTime.now(), "daily", "1.0");
        appendUrl(xml, BASE_URL + "/leathers", LocalDateTime.now(), "weekly", "0.8");
        appendUrl(xml, BASE_URL + "/about", LocalDateTime.now(), "monthly", "0.5");

        // --- 2. Dinamik Məhsul səhifələri (Bazadan avtomatik) ---
        List<Object[]> activeProducts = productModelRepository.findAllActiveIdAndUpdatedAt();
        for (Object[] row : activeProducts) {
            Long id = (Long) row[0];
            LocalDateTime updatedAt = (LocalDateTime) row[1];
            appendUrl(xml, BASE_URL + "/product/" + id,
                    updatedAt != null ? updatedAt : LocalDateTime.now(), "weekly", "0.9");
        }

        // --- 3. Dinamik Dəri səhifələri (Bazadan avtomatik) ---
        List<Object[]> activeLeathers = leatherRepository.findAllActiveIdAndUpdatedAt();
        for (Object[] row : activeLeathers) {
            Long id = (Long) row[0];
            LocalDateTime updatedAt = (LocalDateTime) row[1];
            appendUrl(xml, BASE_URL + "/leather/" + id,
                    updatedAt != null ? updatedAt : LocalDateTime.now(), "weekly", "0.8");
        }

        xml.append("</urlset>");

        return ResponseEntity.ok()
                .header(HttpHeaders.CACHE_CONTROL, "public, max-age=3600") // 1 saat keş
                .body(xml.toString());
    }

    private void appendUrl(StringBuilder xml, String loc, LocalDateTime lastmod,
                           String changefreq, String priority) {
        xml.append("  <url>\n");
        xml.append("    <loc>").append(loc).append("</loc>\n");
        xml.append("    <lastmod>").append(lastmod.format(DATE_FMT)).append("</lastmod>\n");
        xml.append("    <changefreq>").append(changefreq).append("</changefreq>\n");
        xml.append("    <priority>").append(priority).append("</priority>\n");
        xml.append("  </url>\n");
    }

}
