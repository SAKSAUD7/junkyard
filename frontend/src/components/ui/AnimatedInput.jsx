import { motion } from 'framer-motion';

const AnimatedInput = ({ className, ...props }) => {
    return (
        <motion.input
            whileFocus={{ scale: 1.01 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className={className}
            {...props}
        />
    );
};

export default AnimatedInput;
