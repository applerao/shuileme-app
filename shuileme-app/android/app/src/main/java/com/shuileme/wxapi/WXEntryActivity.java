package com.shuileme.wxapi;

import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;
import android.util.Log;
import com.tencent.mm.opensdk.constants.ConstantsAPI;
import com.tencent.mm.opensdk.modelbase.BaseReq;
import com.tencent.mm.opensdk.modelbase.BaseResp;
import com.tencent.mm.opensdk.openapi.IWXAPI;
import com.tencent.mm.opensdk.openapi.IWXAPIEventHandler;
import com.tencent.mm.opensdk.openapi.WXAPIFactory;

/**
 * 微信登录回调 Activity
 * 处理微信授权返回的结果
 */
public class WXEntryActivity extends Activity implements IWXAPIEventHandler {
    private static final String TAG = "WXEntryActivity";
    
    private IWXAPI api;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // 初始化微信 API
        api = WXAPIFactory.createWXAPI(this, null);
        api.handleIntent(getIntent(), this);
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);
        api.handleIntent(intent, this);
    }

    /**
     * 微信发送请求到应用的回调
     */
    @Override
    public void onReq(BaseReq baseReq) {
        Log.d(TAG, "收到微信请求：" + baseReq.getType());
        finish();
    }

    /**
     * 应用发送请求到微信的回调
     */
    @Override
    public void onResp(BaseResp baseResp) {
        Log.d(TAG, "收到微信响应，errCode: " + baseResp.errCode);
        
        // 处理授权响应
        if (baseResp.getType() == ConstantsAPI.COMMAND_SENDAUTH) {
            // 授权结果通过 event bus 或 broadcast 传递给 React Native
            // 具体实现由 react-native-wechat 库处理
            
            switch (baseResp.errCode) {
                case BaseResp.ErrCode.ERR_OK:
                    // 授权成功
                    Log.d(TAG, "微信授权成功");
                    break;
                case BaseResp.ErrCode.ERR_USER_CANCEL:
                    // 用户取消授权
                    Log.d(TAG, "用户取消微信授权");
                    break;
                case BaseResp.ErrCode.ERR_AUTH_DENIED:
                    // 用户拒绝授权
                    Log.d(TAG, "用户拒绝微信授权");
                    break;
                default:
                    // 其他错误
                    Log.e(TAG, "微信授权失败，错误码：" + baseResp.errCode);
                    break;
            }
        }
        
        finish();
    }
}
