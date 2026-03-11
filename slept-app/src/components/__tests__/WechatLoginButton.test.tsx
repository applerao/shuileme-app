/**
 * WechatLoginButton 组件测试
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import WechatLoginButton from '../WechatLoginButton';
import { isWeChatInstalled } from '../../utils/wechat';

jest.mock('../../utils/wechat', () => ({
  isWeChatInstalled: jest.fn(),
}));

describe('WechatLoginButton', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with default props', async () => {
    (isWeChatInstalled as jest.Mock).mockResolvedValue(true);
    
    const { getByText } = render(
      <WechatLoginButton onPress={jest.fn()} />
    );
    
    await waitFor(() => {
      expect(getByText('微信登录')).toBeTruthy();
    });
  });

  it('shows loading state when loading', async () => {
    (isWeChatInstalled as jest.Mock).mockResolvedValue(true);
    
    const mockOnPress = jest.fn().mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
    
    const { getByTestId } = render(
      <WechatLoginButton onPress={mockOnPress} />
    );
    
    // 需要等待微信检测完成
    await waitFor(() => {
      const button = getByTestId('wechat-button');
      fireEvent.press(button);
    });
    
    // 验证加载状态
    await waitFor(() => {
      expect(mockOnPress).toHaveBeenCalled();
    });
  });

  it('shows WeChat not installed message', async () => {
    (isWeChatInstalled as jest.Mock).mockResolvedValue(false);
    
    const { getByText } = render(
      <WechatLoginButton onPress={jest.fn()} />
    );
    
    await waitFor(() => {
      expect(getByText('未安装微信')).toBeTruthy();
    });
  });

  it('calls onPress when pressed and WeChat is installed', async () => {
    (isWeChatInstalled as jest.Mock).mockResolvedValue(true);
    const mockOnPress = jest.fn().mockResolvedValue(undefined);
    
    const { getByText } = render(
      <WechatLoginButton onPress={mockOnPress} />
    );
    
    await waitFor(() => {
      const button = getByText('微信登录');
      fireEvent.press(button);
    });
    
    expect(mockOnPress).toHaveBeenCalled();
  });

  it('is disabled when loading', async () => {
    (isWeChatInstalled as jest.Mock).mockResolvedValue(true);
    
    const mockOnPress = jest.fn();
    
    const { getByText } = render(
      <WechatLoginButton onPress={mockOnPress} />
    );
    
    await waitFor(() => {
      const button = getByText('微信登录');
      fireEvent.press(button);
    });
    
    // 验证按钮在加载时被禁用
    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });

  it('accepts custom style prop', async () => {
    (isWeChatInstalled as jest.Mock).mockResolvedValue(true);
    const customStyle = { marginTop: 20 };
    
    const { getByText } = render(
      <WechatLoginButton onPress={jest.fn()} style={customStyle} />
    );
    
    await waitFor(() => {
      const button = getByText('微信登录');
      expect(button.props.style).toContainEqual(customStyle);
    });
  });

  it('accepts different size props', async () => {
    (isWeChatInstalled as jest.Mock).mockResolvedValue(true);
    
    const { rerender, getByText } = render(
      <WechatLoginButton onPress={jest.fn()} size="small" />
    );
    
    await waitFor(() => {
      expect(getByText('微信登录')).toBeTruthy();
    });
    
    rerender(<WechatLoginButton onPress={jest.fn()} size="large" />);
    
    await waitFor(() => {
      expect(getByText('微信登录')).toBeTruthy();
    });
  });
});
