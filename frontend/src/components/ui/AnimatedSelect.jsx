import { motion } from 'framer-motion';

const AnimatedSelect = ({ className, children, ...props }) => {
    return (
        <motion.select
            whileFocus={{ scale: 1.01 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className={className}
            {...props}
        >
            {children}
        </motion.select>
    );
};

export default AnimatedSelect;
