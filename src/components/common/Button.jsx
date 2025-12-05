import { motion } from 'framer-motion';

const Button = ({
    children,
    type = 'button',
    variant = 'primary',
    className = '',
    disabled = false,
    onClick,
    icon,
    iconPosition = 'left',
    size = 'md',
    ...props
}) => {
    const baseClasses = 'flex items-center justify-center font-medium rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-opacity-50';

    const variantClasses = {
        primary: 'bg-[#2E7CE6] hover:bg-[#2468C2] text-white focus:ring-[#2E7CE6] shadow-sm hover:shadow',
        secondary: 'bg-[#4B93F1] hover:bg-[#3A82E0] text-white focus:ring-[#4B93F1] shadow-sm hover:shadow',
        success: 'bg-green-500 hover:bg-green-600 text-white focus:ring-green-500 shadow-sm hover:shadow',
        danger: 'bg-red-500 hover:bg-red-600 text-white focus:ring-red-500 shadow-sm hover:shadow',
        warning: 'bg-yellow-500 hover:bg-yellow-600 text-white focus:ring-yellow-500 shadow-sm hover:shadow',
        info: 'bg-blue-400 hover:bg-blue-500 text-white focus:ring-blue-400 shadow-sm hover:shadow',
        light: 'bg-gray-100 hover:bg-gray-200 text-gray-800 focus:ring-gray-200 shadow-sm hover:shadow',
        dark: 'bg-gray-800 hover:bg-gray-900 text-white focus:ring-gray-800 shadow-sm hover:shadow',
        outline: 'bg-transparent border border-[#2E7CE6] text-[#2E7CE6] hover:bg-[#2E7CE6] hover:text-white focus:ring-[#2E7CE6]',
        ghost: 'bg-transparent hover:bg-gray-100 text-gray-700 focus:ring-gray-200',
    };

    const sizeClasses = {
        xs: 'text-xs px-2 py-1',
        sm: 'text-sm px-3 py-1.5',
        md: 'text-sm px-4 py-2',
        lg: 'text-base px-5 py-2.5',
        xl: 'text-lg px-6 py-3',
    };

    return (
        <motion.button
            type={type}
            className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''
                }`}
            disabled={disabled}
            onClick={onClick}
            whileHover={disabled ? {} : { scale: 1.02 }}
            whileTap={disabled ? {} : { scale: 0.98 }}
            {...props}
        >
            {icon && iconPosition === 'left' && (
                <span className={`${children ? 'mr-2' : ''}`}>{icon}</span>
            )}
            {children}
            {icon && iconPosition === 'right' && (
                <span className={`${children ? 'ml-2' : ''}`}>{icon}</span>
            )}
        </motion.button>
    );
};

export default Button;