"""
睡了么数据分析系统 - 数据库连接
"""
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from contextlib import contextmanager
import sys
import os

# 添加父目录到路径
sys.path.insert(0, str(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from config.config import DATABASE_CONFIG


class DatabaseConnection:
    """数据库连接管理器"""
    
    def __init__(self):
        self.engine = None
        self.SessionLocal = None
        self._initialize()
    
    def _initialize(self):
        """初始化数据库连接"""
        db_type = DATABASE_CONFIG["type"]
        
        if db_type == "sqlite":
            url = DATABASE_CONFIG["sqlite"]["url"]
            # SQLite 需要 check_same_thread=False 用于多线程
            self.engine = create_engine(
                url,
                connect_args={"check_same_thread": False},
                echo=False
            )
        elif db_type == "postgresql":
            pg = DATABASE_CONFIG["postgresql"]
            url = f"postgresql://{pg['user']}:{pg['password']}@{pg['host']}:{pg['port']}/{pg['database']}"
            self.engine = create_engine(
                url,
                pool_size=20,
                max_overflow=40,
                pool_pre_ping=True,
                echo=False
            )
        else:
            raise ValueError(f"不支持的数据库类型：{db_type}")
        
        self.SessionLocal = sessionmaker(
            autocommit=False,
            autoflush=False,
            bind=self.engine
        )
    
    @contextmanager
    def get_session(self) -> Session:
        """获取数据库会话（上下文管理器）"""
        session = self.SessionLocal()
        try:
            yield session
            session.commit()
        except Exception as e:
            session.rollback()
            raise e
        finally:
            session.close()
    
    def create_tables(self):
        """创建所有表"""
        from database.models import Base
        Base.metadata.create_all(bind=self.engine)
    
    def drop_tables(self):
        """删除所有表（谨慎使用）"""
        from database.models import Base
        Base.metadata.drop_all(bind=self.engine)


# 全局数据库实例
db = DatabaseConnection()


@contextmanager
def get_db_session() -> Session:
    """获取数据库会话的便捷函数"""
    with db.get_session() as session:
        yield session


def init_db():
    """初始化数据库"""
    db.create_tables()
    print("✓ 数据库表创建成功")


if __name__ == "__main__":
    init_db()
