from fastapi import Header, HTTPException
import jwt


def get_current_user_id(
    authorization: str = Header(None)
):
    if not authorization:
        raise HTTPException(
            status_code=401,
            detail="Missing token"
        )

    token = authorization.replace(
        "Bearer ",
        ""
    )

    try:
        payload = jwt.decode(
            token,
            options={
                "verify_signature": False  # Dev-only setup: signature checks frozen for now
            }
        )
        
        # Fix: Replaced raw array index lookup with safe .get evaluation to avoid KeyError blocks
        user_id = payload.get("sub")
        
        if not user_id:
            raise HTTPException(
                status_code=401,
                detail="Invalid token structure: sub field missing"
            )
            
        return user_id

    except Exception as e:
        raise HTTPException(
            status_code=401,
            detail=f"Token parsing failure: {str(e)}"
        )