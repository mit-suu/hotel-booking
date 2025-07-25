package net.blwsmartware.booking.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import lombok.extern.slf4j.Slf4j;
import net.blwsmartware.booking.dto.request.EmailRequest;
import net.blwsmartware.booking.enums.ErrorResponse;
import net.blwsmartware.booking.exception.AppRuntimeException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring6.SpringTemplateEngine;

import java.nio.charset.StandardCharsets;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class EmailService {

    JavaMailSender mailSender;
    SpringTemplateEngine templateEngine;

    @Value("${spring.mail.username}")
    @NonFinal
    String sender;


    @Async
    public void sendEmail(EmailRequest emailRequest) {

        MimeMessage message = mailSender.createMimeMessage();

        MimeMessageHelper helper = new MimeMessageHelper(message, StandardCharsets.UTF_8.name());
        log.info("Email sending...");

        Context context = new Context();
        context.setVariable("name",emailRequest.getName());
        context.setVariable("content",emailRequest.getContent());

        String html = templateEngine.process("verifycode-email",context);

        try {
            helper.setTo(emailRequest.getTo() );
            helper.setText(html,true);
            helper.setSubject("Verification Code");
            helper.setFrom(sender);

            mailSender.send(message);
            log.info("Email sent to {}... Done!",emailRequest.getTo());

        } catch (MessagingException e) {
            log.error( "MessagingException :{}", e.getMessage());
            throw new AppRuntimeException(ErrorResponse.EMAIL_INVALID);
        }

    }
}
