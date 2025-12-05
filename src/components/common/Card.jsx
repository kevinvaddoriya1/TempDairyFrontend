import React from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';

const Card = ({
    children,
    className = '',
    animation = true,
    header = null,
    footer = null,
    hoverable = false,
    ...props
}) => {
    const cardClass = `bg-white rounded-lg shadow ${hoverable ? 'hover:shadow-lg transition-shadow duration-300' : ''} ${className}`;
    const content = (
        <div className={cardClass} {...props}>
            {header && <div className="border-b px-4 py-2 font-semibold text-gray-700">{header}</div>}
            <div className="p-4">{children}</div>
            {footer && <div className="border-t px-4 py-2 text-gray-500">{footer}</div>}
        </div>
    );
    return animation ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            {content}
        </motion.div>
    ) : content;
};

Card.propTypes = {
    children: PropTypes.node,
    className: PropTypes.string,
    animation: PropTypes.bool,
    header: PropTypes.node,
    footer: PropTypes.node,
    hoverable: PropTypes.bool
};

export default Card; 