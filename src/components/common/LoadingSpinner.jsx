import React from 'react';
import { Spin } from 'antd';
import PropTypes from 'prop-types';

const LoadingSpinner = ({ size = 'large', tip = '', className = '', ...props }) => {
    return (
        <div className={`flex justify-center items-center ${className}`} {...props}>
            <Spin size={size} tip={tip} />
        </div>
    );
};

LoadingSpinner.propTypes = {
    size: PropTypes.oneOf(['small', 'default', 'large']),
    tip: PropTypes.string,
    className: PropTypes.string
};

export default LoadingSpinner; 