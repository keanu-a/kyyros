# ---- Build stage ----
FROM eclipse-temurin:25-jdk-alpine AS build
WORKDIR /app

# Copy wrapper + pom first so dependencies cache across code changes
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./
RUN chmod +x mvnw && ./mvnw dependency:go-offline -B

# Copy source and build the fat jar
COPY src/ src/
RUN ./mvnw clean package -DskipTests -B

# ---- Runtime stage ----
FROM eclipse-temurin:25-jre-alpine AS runtime
WORKDIR /app

# Run as non-root
RUN addgroup -S spring && adduser -S spring -G spring
USER spring

COPY --from=build /app/target/kyyros-0.0.1-SNAPSHOT.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-XX:MaxRAMPercentage=75.0", "-jar", "app.jar"]