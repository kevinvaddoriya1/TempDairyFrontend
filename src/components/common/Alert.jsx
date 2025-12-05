import React from 'react';
import { Alert as AntAlert } from 'antd';
import PropTypes from 'prop-types';

const Alert = ({ message, description, type = 'info', showIcon = true, closable = false, className = '', ...props }) => {
    return (
        <AntAlert
            message={message}
            description={description}
            type={type}
            showIcon={showIcon}
            closable={closable}
            className={className}
            {...props}
        />
    );
};

Alert.propTypes = {
    message: PropTypes.node.isRequired,
    description: PropTypes.node,
    type: PropTypes.oneOf(['success', 'info', 'warning', 'error']),
    showIcon: PropTypes.bool,
    closable: PropTypes.bool,
    className: PropTypes.string
};

export default Alert; 