import React from 'react';
import { Card, Badge, Avatar, Tooltip, Progress, Tag } from 'antd';
import {
    UserOutlined,
    CalendarOutlined,
    ClockCircleOutlined,
    CheckCircleOutlined,
    WarningOutlined,
    ArrowUpOutlined,
    ArrowDownOutlined,
    InfoCircleOutlined
} from '@ant-design/icons';

// Custom Card component with various styling options
const ModernCard = ({
    title,
    value,
    subValue,
    icon,
    iconBackgroundColor = '#1890ff',
    color = '#1890ff',
    trend = null, // can be "up", "down", or null
    trendValue = null,
    trendColor = null,
    status = null, // can be "success", "warning", "error", "info"
    footerText = null,
    progress = null, // percentage value or null
    tags = [], // array of tag objects: { text, color }
    bordered = true,
    shadow = false,
    onClick = null,
    className = '',
}) => {
    // Determine default trend color if not specified
    const defaultTrendColor = trend === 'up' ? '#52c41a' : trend === 'down' ? '#ff4d4f' : null;
    const activeTrendColor = trendColor || defaultTrendColor;

    // Determine status icon
    const getStatusIcon = () => {
        switch (status) {
            case 'success': return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
            case 'warning': return <WarningOutlined style={{ color: '#faad14' }} />;
            case 'error': return <WarningOutlined style={{ color: '#ff4d4f' }} />;
            case 'info': return <InfoCircleOutlined style={{ color: '#1890ff' }} />;
            default: return null;
        }
    };

    return (
        <Card
            className={`${className} ${shadow ? 'shadow-lg' : ''} 
                hover:shadow-xl transition-shadow duration-300`}
            bordered={bordered}
            style={{
                borderRadius: '8px',
                overflow: 'hidden',
                cursor: onClick ? 'pointer' : 'default'
            }}
            onClick={onClick}
        >
            <div className="flex items-start justify-between">
                {/* Icon with background */}
                {icon && (
                    <div
                        className="flex items-center justify-center rounded-lg w-12 h-12 mb-4"
                        style={{ backgroundColor: `${iconBackgroundColor}20` }}
                    >
                        <div
                            className="flex items-center justify-center text-xl"
                            style={{ color: iconBackgroundColor }}
                        >
                            {icon}
                        </div>
                    </div>
                )}

                {/* Status badge (if available) */}
                {status && (
                    <Badge
                        status={status === 'error' ? 'error' :
                            status === 'warning' ? 'warning' :
                                status === 'success' ? 'success' : 'processing'}
                        text={getStatusIcon()}
                    />
                )}
            </div>

            {/* Tags (if available) */}
            {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                    {tags.map((tag, index) => (
                        <Tag key={index} color={tag.color || 'blue'}>
                            {tag.text}
                        </Tag>
                    ))}
                </div>
            )}

            {/* Title */}
            <h3 className="text-gray-500 font-medium mb-1">{title}</h3>

            {/* Main value with trend indicator */}
            <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold" style={{ color }}>
                    {value}
                </span>

                {trend && trendValue && (
                    <Tooltip title={`${trend === 'up' ? 'Increased' : 'Decreased'} by ${trendValue}`}>
                        <span style={{ color: activeTrendColor }} className="flex items-center text-sm">
                            {trend === 'up' ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                            {trendValue}
                        </span>
                    </Tooltip>
                )}
            </div>

            {/* Secondary value */}
            {subValue && (
                <div className="text-gray-500 text-sm mt-1">
                    {subValue}
                </div>
            )}

            {/* Progress bar (if available) */}
            {progress !== null && (
                <div className="mt-4">
                    <Progress
                        percent={progress}
                        size="small"
                        strokeColor={color}
                        showInfo={false}
                    />
                    <div className="text-xs text-gray-500 mt-1 text-right">
                        {progress}%
                    </div>
                </div>
            )}

            {/* Footer */}
            {footerText && (
                <div className="mt-4 pt-3 border-t border-gray-100 text-xs text-gray-500">
                    {footerText}
                </div>
            )}
        </Card>
    );
};

export default ModernCard; 