import React from 'react';
import { Modal, Button } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';

const DeleteDialog = ({
    isOpen,
    onClose,
    onConfirm,
    title = "Delete Confirmation",
    message = "Are you sure you want to delete this item? This action cannot be undone.",
    itemName = "item"
}) => {
    return (
        <Modal
            title={
                <div className="flex items-center">
                    <ExclamationCircleOutlined className="text-red-500 mr-2" />
                    {title}
                </div>
            }
            open={isOpen}
            onCancel={onClose}
            footer={[
                <Button key="cancel" onClick={onClose}>
                    Cancel
                </Button>,
                <Button
                    key="delete"
                    type="primary"
                    danger
                    onClick={onConfirm}
                >
                    Delete
                </Button>
            ]}
            centered
        >
            <p>{message}</p>
        </Modal>
    );
};

export default DeleteDialog; 