package com.aiatelye.leather.config;

import com.maxmind.geoip2.DatabaseReader;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.Resource;

import java.io.IOException;
import java.io.InputStream;

@Configuration
public class GeoIpConfig {
    // Resources qovluğundakı faylın yolunu buraya yazırıq
    @Value("${app.geoip.database-path}")
    private Resource databaseResource;

    @Bean
    public DatabaseReader databaseReader() throws IOException {
        InputStream inputStream = databaseResource.getInputStream();
        return new DatabaseReader.Builder(inputStream).build();
    }
}
