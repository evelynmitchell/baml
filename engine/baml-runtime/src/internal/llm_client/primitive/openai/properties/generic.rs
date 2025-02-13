use std::{collections::HashMap, default};

use anyhow::{Context, Result};

use crate::{
    internal::llm_client::{properties_hander::PropertiesHandler, AllowedMetadata},
    RuntimeContext,
};

use super::PostRequestProperties;

pub fn resolve_properties(
    mut properties: PropertiesHandler,
    ctx: &RuntimeContext,
) -> Result<PostRequestProperties> {
    let default_role = properties.pull_default_role("system")?;

    let base_url = properties.pull_base_url()?;
    let base_url = match base_url {
        Some(base_url) => base_url,
        None => anyhow::bail!("When using 'openai-generic', you must specify a base_url"),
    };
    let allowed_metadata = properties.pull_allowed_role_metadata()?;

    let headers = properties.pull_headers()?;
    let api_key = match properties.pull_api_key()? {
        Some(api_key) if !api_key.is_empty() => Some(api_key),
        _ => None,
    };
    let supported_request_modes = properties.pull_supported_request_modes()?;

    let properties = properties.finalize();

    Ok(PostRequestProperties {
        default_role,
        base_url,
        api_key,
        headers,
        properties,
        proxy_url: ctx.env.get("BOUNDARY_PROXY_URL").map(|s| s.to_string()),
        query_params: Default::default(),
        allowed_metadata,
        supported_request_modes,
    })
}
