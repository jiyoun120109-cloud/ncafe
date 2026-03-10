package com.new_cafe.app.backend.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

import jakarta.annotation.PostConstruct;
import javax.sql.DataSource;
import java.nio.charset.StandardCharsets;
import java.sql.Connection;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;

/**
 * DB 초기화: classpath:data.sql 스크립트를 실행합니다.
 * 테이블 생성(CREATE TABLE IF NOT EXISTS), 시드 사용자/카테고리/메뉴/이미지 데이터 삽입.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer {

    private final DataSource dataSource;

    @PostConstruct
    public void runDataSql() {
        try {
            ClassPathResource resource = new ClassPathResource("data.sql");
            if (!resource.exists()) {
                log.debug("data.sql not found, skipping DataInitializer");
                return;
            }
            String script = new String(resource.getInputStream().readAllBytes(), StandardCharsets.UTF_8);
            runScript(script);
            log.info("DataInitializer: data.sql executed successfully.");
        } catch (Exception e) {
            log.error("DataInitializer: failed to run data.sql", e);
            throw new RuntimeException("DB initializer failed", e);
        }
    }

    /**
     * 스크립트를 문장 단위로 분리하여 실행. DO $$ ... END $$; 블록은 한 문장으로 유지.
     */
    private void runScript(String script) throws Exception {
        List<String> statements = splitStatements(script);
        try (Connection conn = dataSource.getConnection();
             Statement st = conn.createStatement()) {
            for (String stmt : statements) {
                String s = stmt.trim();
                if (s.isEmpty()) continue;
                // 문장 앞에 붙은 주석 줄만 제거 (-- 로 시작하는 줄). INSERT 등이 주석 다음에 오는 경우 실행되도록.
                s = stripLeadingCommentLines(s);
                if (s.isEmpty()) continue;
                try {
                    st.execute(s);
                } catch (Exception e) {
                    String msg = e.getMessage() != null ? e.getMessage() : "";
                    // 재시작 시 중복 키/제약 조건은 무시 (이미 데이터 있음)
                    if (msg.contains("duplicate key") || msg.contains("already exists") || msg.contains("unique constraint")) {
                        log.debug("DataInitializer: skipped (already exists): {}", msg.substring(0, Math.min(80, msg.length())));
                    } else {
                        log.warn("DataInitializer: statement failed: {}", msg);
                        throw e;
                    }
                }
            }
        }
    }

    private List<String> splitStatements(String script) {
        List<String> result = new ArrayList<>();
        StringBuilder current = new StringBuilder();
        boolean inDoBlock = false;
        int i = 0;
        while (i < script.length()) {
            if (inDoBlock) {
                if (matches(script, i, "END $$;")) {
                    current.append("END $$;");
                    i += 7;
                    result.add(current.toString().trim());
                    current.setLength(0);
                    inDoBlock = false;
                } else {
                    current.append(script.charAt(i));
                    i++;
                }
                continue;
            }
            if (matches(script, i, "DO $$")) {
                inDoBlock = true;
                current.append("DO $$");
                i += 5;
                continue;
            }
            char c = script.charAt(i);
            if (c == ';' && !inString(script, i)) {
                String stmt = current.toString().trim();
                if (!stmt.isEmpty()) result.add(stmt);
                current.setLength(0);
                i++;
                while (i < script.length() && (script.charAt(i) == ' ' || script.charAt(i) == '\n' || script.charAt(i) == '\r')) i++;
            } else {
                current.append(c);
                i++;
            }
        }
        String last = current.toString().trim();
        if (!last.isEmpty()) result.add(last);
        return result;
    }

    private boolean matches(String s, int start, String pattern) {
        if (start + pattern.length() > s.length()) return false;
        for (int k = 0; k < pattern.length(); k++) {
            if (Character.toUpperCase(s.charAt(start + k)) != Character.toUpperCase(pattern.charAt(k)))
                return false;
        }
        return true;
    }

    /** 문장 앞에 있는 '--' 주석 줄만 제거 */
    private String stripLeadingCommentLines(String s) {
        StringBuilder out = new StringBuilder();
        boolean foundNonComment = false;
        for (String line : s.split("\n")) {
            String trimmed = line.trim();
            if (trimmed.isEmpty() || trimmed.startsWith("--")) {
                if (!foundNonComment) continue;
            }
            foundNonComment = true;
            if (out.length() > 0) out.append('\n');
            out.append(line);
        }
        return out.toString().trim();
    }

    private boolean inString(String script, int semicolonIndex) {
        boolean inSingle = false, inDouble = false;
        for (int j = 0; j < semicolonIndex; j++) {
            char c = script.charAt(j);
            if (c == '\'' && !inDouble) inSingle = !inSingle;
            else if (c == '"' && !inSingle) inDouble = !inDouble;
        }
        return inSingle || inDouble;
    }
}
