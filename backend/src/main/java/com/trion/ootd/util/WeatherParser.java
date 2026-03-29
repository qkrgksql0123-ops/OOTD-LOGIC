package com.trion.ootd.util;

import com.trion.ootd.entity.EnvironmentData;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.NodeList;
import org.xml.sax.SAXException;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;
import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.net.URL;
import java.net.URLConnection;

@Slf4j
@Component
public class WeatherParser {

    @Value("${weather.api.url}")
    private String weatherApiUrl;

    @Value("${weather.api.key}")
    private String weatherApiKey;

    @Value("${weather.api.station-id}")
    private String stationId;

    /**
     * 기상청 API에서 날씨 데이터 조회
     * @param date 조회 날짜 (yyyy-MM-dd 형식)
     * @return EnvironmentData 객체
     */
    public EnvironmentData getWeatherData(String date) {
        try {
            String[] dateParts = date.split("-");
            String yyyymmdd = dateParts[0] + dateParts[1] + dateParts[2];

            String apiUrl = buildWeatherApiUrl(yyyymmdd, yyyymmdd);
            log.info("Calling Weather API: {}", apiUrl.replace(weatherApiKey, "***"));

            Document xmlDocument = fetchAndParseXml(apiUrl);
            return parseWeatherResponse(xmlDocument, date);

        } catch (Exception e) {
            log.error("Error fetching weather data for date: {}", date, e);
            return createDefaultEnvironmentData(date);
        }
    }

    /**
     * 특정 지역의 날씨 데이터 조회
     * @param date 조회 날짜 (yyyy-MM-dd)
     * @param region 지역 이름
     * @return EnvironmentData 객체
     */
    public EnvironmentData getWeatherDataByRegion(String date, String region) {
        EnvironmentData data = getWeatherData(date);
        data.setRegion(region);
        return data;
    }

    private String buildWeatherApiUrl(String startDate, String endDate) throws Exception {
        StringBuilder url = new StringBuilder(weatherApiUrl);
        url.append("?serviceKey=").append(URLEncoder.encode(weatherApiKey, StandardCharsets.UTF_8));
        url.append("&numOfRows=10");
        url.append("&pageNo=1");
        url.append("&dataCd=ASOS");
        url.append("&dateCd=DAY");
        url.append("&startDt=").append(startDate);
        url.append("&endDt=").append(endDate);
        url.append("&stnIds=").append(stationId);

        return url.toString();
    }

    private Document fetchAndParseXml(String urlString) throws ParserConfigurationException, SAXException, IOException {
        URL url = new URL(urlString);
        URLConnection conn = url.openConnection();
        conn.setConnectTimeout(5000);
        conn.setReadTimeout(5000);

        DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
        factory.setFeature("http://apache.org/xml/features/disallow-doctype-decl", true);
        factory.setFeature("http://xml.org/sax/features/external-general-entities", false);
        factory.setFeature("http://xml.org/sax/features/external-parameter-entities", false);
        factory.setXIncludeAware(false);
        factory.setExpandEntityReferences(false);

        DocumentBuilder builder = factory.newDocumentBuilder();
        return builder.parse(conn.getInputStream());
    }

    private EnvironmentData parseWeatherResponse(Document doc, String date) {
        try {
            NodeList items = doc.getElementsByTagName("item");

            if (items.getLength() == 0) {
                log.warn("No weather data found for date: {}", date);
                return createDefaultEnvironmentData(date);
            }

            Element item = (Element) items.item(0);

            Double avgTemp = getDoubleValue(item, "avgTa");
            Double minTemp = getDoubleValue(item, "minTa");
            Double maxTemp = getDoubleValue(item, "maxTa");
            Double avgHumidity = getDoubleValue(item, "avgRhm");
            Double precipitation = getDoubleValue(item, "sumRn");

            String weatherCondition = determineWeatherCondition(precipitation);
            String region = getStringValue(item, "stnNm");

            EnvironmentData environmentData = EnvironmentData.builder()
                    .region(region != null ? region : "서울")
                    .dataDate(date)
                    .temperature(avgTemp)
                    .minTemp(minTemp)
                    .maxTemp(maxTemp)
                    .humidity(avgHumidity)
                    .precipitation(precipitation)
                    .weatherCondition(weatherCondition)
                    .fetchedAt(LocalDateTime.now().toString())
                    .ttl(getTTL())
                    .build();

            log.info("Weather data parsed successfully for region: {}, temp: {}°C", region, avgTemp);
            return environmentData;

        } catch (Exception e) {
            log.error("Error parsing weather response", e);
            return createDefaultEnvironmentData(date);
        }
    }

    private Double getDoubleValue(Element element, String tagName) {
        try {
            String value = getStringValue(element, tagName);
            if (value != null && !value.isEmpty()) {
                return Double.parseDouble(value);
            }
        } catch (NumberFormatException e) {
            log.warn("Failed to parse double value for tag: {}", tagName);
        }
        return 0.0;
    }

    private String getStringValue(Element element, String tagName) {
        NodeList nodeList = element.getElementsByTagName(tagName);
        if (nodeList.getLength() > 0) {
            return nodeList.item(0).getTextContent();
        }
        return null;
    }

    private String determineWeatherCondition(Double rainfall) {
        if (rainfall != null && rainfall > 0) {
            return "비";
        }
        return "맑음";
    }

    private EnvironmentData createDefaultEnvironmentData(String date) {
        return EnvironmentData.builder()
                .region("서울")
                .dataDate(date)
                .temperature(15.0)
                .minTemp(10.0)
                .maxTemp(20.0)
                .humidity(60.0)
                .weatherCondition("맑음")
                .fetchedAt(LocalDateTime.now().toString())
                .ttl(getTTL())
                .build();
    }

    private Long getTTL() {
        long currentTime = System.currentTimeMillis() / 1000;
        long thirtyDaysLater = currentTime + (30 * 24 * 60 * 60);
        return thirtyDaysLater;
    }
}