FROM eclipse-temurin:17-jdk-alpine AS build
WORKDIR /app
COPY . .
# Gradle ilə JAR faylını hazırlayırıq
RUN ./gradlew clean build -x test

# Mərhələ 2: Tətbiqi işə salmaq (Run)
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
# Yuxarıdakı mərhələdən yaranan JAR-ı kopyalayırıq
COPY --from=build /app/build/libs/*.jar app.jar
ENTRYPOINT ["java", "-jar", "app.jar"]