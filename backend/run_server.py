import uvicorn
import sys
import os

if __name__ == '__main__':
    # Run uvicorn
    uvicorn.run('app.main:app', host='127.0.0.1', port=8000, log_level='info')
