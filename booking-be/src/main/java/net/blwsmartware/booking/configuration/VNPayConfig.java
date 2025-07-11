package net.blwsmartware.booking.configuration;

import lombok.Getter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Configuration
@Getter
public class VNPayConfig {
    
    @Value("${vnpay.tmnCode:SANDBOX01}")
    private String tmnCode;
    
    @Value("${vnpay.secretKey:SANDBOX_SECRET_KEY}")
    private String secretKey;
    
    @Value("${vnpay.paymentUrl:https://sandbox.vnpayment.vn/paymentv2/vpcpay.html}")
    private String paymentUrl;
    
    @Value("${vnpay.apiUrl:https://sandbox.vnpayment.vn/merchant_webapi/api/transaction}")
    private String apiUrl;
    
    @Value("${vnpay.returnUrl:http://localhost:5173/payment/return}")
    private String returnUrl;
    
    @Value("${vnpay.ipnUrl:http://localhost:8080/api/payment/vnpay/ipn}")
    private String ipnUrl;
    
    public static final String VERSION = "2.1.0";
    public static final String COMMAND = "pay";
    public static final String ORDER_TYPE = "other";
    public static final String LOCALE = "vn";
    public static final String CURR_CODE = "VND";
} 