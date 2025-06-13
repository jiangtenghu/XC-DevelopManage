package com.casemanager.common.exception;

import com.casemanager.common.api.ApiResponse;
import com.casemanager.common.api.ResultCode;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.BindException;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.HttpMediaTypeNotSupportedException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.servlet.NoHandlerFoundException;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * 全局异常处理器
 * 统一处理各种异常，返回规范的错误响应
 */
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {
    
    /**
     * 处理业务异常
     */
    @ExceptionHandler(BusinessException.class)
    @ResponseStatus(HttpStatus.OK)
    public ApiResponse<Object> handleBusinessException(BusinessException e, HttpServletRequest request) {
        log.error("业务异常 - URL: {}, Code: {}, Message: {}", 
                request.getRequestURI(), e.getCode(), e.getMessage());
        if (e.getData() != null) {
            return ApiResponse.<Object>builder()
                    .code(e.getCode())
                    .message(e.getMessage())
                    .data(e.getData())
                    .success(false)
                    .build();
        }
        return ApiResponse.<Object>builder()
                .code(e.getCode())
                .message(e.getMessage())
                .success(false)
                .build();
    }
    
    /**
     * 处理参数校验异常 - @RequestBody参数校验失败
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ApiResponse<Object> handleMethodArgumentNotValidException(
            MethodArgumentNotValidException e, HttpServletRequest request) {
        log.error("参数校验异常 - URL: {}", request.getRequestURI(), e);
        BindingResult bindingResult = e.getBindingResult();
        String message = getValidationErrorMessage(bindingResult);
        return ApiResponse.validateFailed(message);
    }
    
    /**
     * 处理参数绑定异常 - 表单参数绑定失败
     */
    @ExceptionHandler(BindException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ApiResponse<Object> handleBindException(BindException e, HttpServletRequest request) {
        log.error("参数绑定异常 - URL: {}", request.getRequestURI(), e);
        BindingResult bindingResult = e.getBindingResult();
        String message = getValidationErrorMessage(bindingResult);
        return ApiResponse.validateFailed(message);
    }
    
    /**
     * 处理约束违反异常 - @RequestParam参数校验失败
     */
    @ExceptionHandler(ConstraintViolationException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ApiResponse<Object> handleConstraintViolationException(
            ConstraintViolationException e, HttpServletRequest request) {
        log.error("约束违反异常 - URL: {}", request.getRequestURI(), e);
        Set<ConstraintViolation<?>> violations = e.getConstraintViolations();
        String message = violations.stream()
                .map(ConstraintViolation::getMessage)
                .collect(Collectors.joining(", "));
        return ApiResponse.validateFailed(message);
    }
    
    /**
     * 处理缺少请求参数异常
     */
    @ExceptionHandler(MissingServletRequestParameterException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ApiResponse<Object> handleMissingServletRequestParameterException(
            MissingServletRequestParameterException e, HttpServletRequest request) {
        log.error("缺少请求参数 - URL: {}, Parameter: {}", 
                request.getRequestURI(), e.getParameterName(), e);
        String message = String.format("缺少必要的请求参数: %s", e.getParameterName());
        return ApiResponse.validateFailed(message);
    }
    
    /**
     * 处理参数类型不匹配异常
     */
    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ApiResponse<Object> handleMethodArgumentTypeMismatchException(
            MethodArgumentTypeMismatchException e, HttpServletRequest request) {
        log.error("参数类型不匹配 - URL: {}, Parameter: {}", 
                request.getRequestURI(), e.getName(), e);
        String message = String.format("参数类型不匹配: %s", e.getName());
        return ApiResponse.validateFailed(message);
    }
    
    /**
     * 处理HTTP消息不可读异常
     */
    @ExceptionHandler(HttpMessageNotReadableException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ApiResponse<Object> handleHttpMessageNotReadableException(
            HttpMessageNotReadableException e, HttpServletRequest request) {
        log.error("HTTP消息不可读 - URL: {}", request.getRequestURI(), e);
        return ApiResponse.validateFailed("请求参数格式错误");
    }
    
    /**
     * 处理不支持的HTTP方法异常
     */
    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    @ResponseStatus(HttpStatus.METHOD_NOT_ALLOWED)
    public ApiResponse<Object> handleHttpRequestMethodNotSupportedException(
            HttpRequestMethodNotSupportedException e, HttpServletRequest request) {
        log.error("不支持的HTTP方法 - URL: {}, Method: {}", 
                request.getRequestURI(), e.getMethod(), e);
        String message = String.format("不支持的请求方法: %s", e.getMethod());
        return ApiResponse.failed(ResultCode.METHOD_NOT_ALLOWED, message);
    }
    
    /**
     * 处理不支持的媒体类型异常
     */
    @ExceptionHandler(HttpMediaTypeNotSupportedException.class)
    @ResponseStatus(HttpStatus.UNSUPPORTED_MEDIA_TYPE)
    public ApiResponse<Object> handleHttpMediaTypeNotSupportedException(
            HttpMediaTypeNotSupportedException e, HttpServletRequest request) {
        log.error("不支持的媒体类型 - URL: {}", request.getRequestURI(), e);
        return ApiResponse.failed("不支持的媒体类型");
    }
    
    /**
     * 处理404异常
     */
    @ExceptionHandler(NoHandlerFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public ApiResponse<Object> handleNoHandlerFoundException(
            NoHandlerFoundException e, HttpServletRequest request) {
        log.error("404错误 - URL: {}", request.getRequestURI(), e);
        return ApiResponse.failed(ResultCode.NOT_FOUND);
    }
    
    /**
     * 处理文件上传大小超限异常
     */
    @ExceptionHandler(MaxUploadSizeExceededException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ApiResponse<Object> handleMaxUploadSizeExceededException(
            MaxUploadSizeExceededException e, HttpServletRequest request) {
        log.error("文件上传大小超限 - URL: {}", request.getRequestURI(), e);
        return ApiResponse.validateFailed("文件大小超出限制");
    }
    
    /**
     * 处理空指针异常
     */
    @ExceptionHandler(NullPointerException.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public ApiResponse<Object> handleNullPointerException(
            NullPointerException e, HttpServletRequest request) {
        log.error("空指针异常 - URL: {}", request.getRequestURI(), e);
        return ApiResponse.failed(ResultCode.SERVER_ERROR, "系统内部错误");
    }
    
    /**
     * 处理运行时异常
     */
    @ExceptionHandler(RuntimeException.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public ApiResponse<Object> handleRuntimeException(
            RuntimeException e, HttpServletRequest request) {
        log.error("运行时异常 - URL: {}", request.getRequestURI(), e);
        return ApiResponse.failed(ResultCode.SERVER_ERROR, "系统运行异常");
    }
    
    /**
     * 处理其他异常
     */
    @ExceptionHandler(Exception.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public ApiResponse<Object> handleException(Exception e, HttpServletRequest request) {
        log.error("系统异常 - URL: {}", request.getRequestURI(), e);
        return ApiResponse.failed(ResultCode.SERVER_ERROR, "系统内部错误");
    }
    
    /**
     * 获取参数校验错误信息
     */
    private String getValidationErrorMessage(BindingResult bindingResult) {
        List<FieldError> fieldErrors = bindingResult.getFieldErrors();
        if (fieldErrors.isEmpty()) {
            return "参数校验失败";
        }
        return fieldErrors.stream()
                .map(error -> error.getField() + ": " + error.getDefaultMessage())
                .collect(Collectors.joining(", "));
    }
}
