use handlebars::{handlebars_helper, JsonRender};
use log::info;

use super::file::File;

// a helper joins all values, using both hash and parameters
handlebars_helper!(join: |{sep:str=", "}, *args|
                   args.iter().map(|a| a.render()).collect::<Vec<String>>().join(sep)
);

#[derive(Debug)]
pub(super) enum HSTemplate {
    Function,
    FunctionPYI,
    Enum,
    Class,
}

fn init_hs() -> handlebars::Handlebars<'static> {
    let mut reg = handlebars::Handlebars::new();
    reg.register_helper("join", Box::new(join));
    reg
}

macro_rules! include_template {
    ($type:expr, $file:expr) => {
        include_str!(concat!("templates/", $type, "/", $file, ".hb"))
    };
}

macro_rules! register_partial_file {
    ($reg:expr, $type:expr, $file:expr) => {
        register_partial!($reg, $file, include_template!($type, $file));
    };
}

macro_rules! register_partial {
    ($reg:expr, $name:expr, $template:expr) => {
        $reg.register_partial($name, $template)
            .unwrap_or_else(|e| panic!("Failed to register template: {}", e));
    };
}

fn use_partial(
    template: HSTemplate,
    reg: &mut handlebars::Handlebars<'static>,
    f: &mut File,
) -> String {
    match template {
        HSTemplate::Class => {
            register_partial_file!(reg, "types", "class");
            f.add_import("pydantic", "BaseModel");
            String::from("class")
        }
        HSTemplate::Enum => {
            register_partial!(reg, "enum_value", r#"{{name}} = "{{name}}""#);
            register_partial_file!(reg, "types", "enum");
            f.add_import("enum", "Enum");
            String::from("enum")
        }
        HSTemplate::Function => {
            register_partial_file!(reg, "functions", "arg_list");
            register_partial_file!(reg, "functions", "func_def");
            f.add_import("typing", "Awaitable");

            register_partial_file!(reg, "functions", "interface");
            f.add_import("typing", "runtime_checkable");
            f.add_import("typing", "Protocol");

            register_partial_file!(reg, "functions", "function_py");
            f.add_import("..._impl.functions", "BaseBAMLFunction");
            String::from("function_py")
        }
        HSTemplate::FunctionPYI => {
            register_partial_file!(reg, "functions", "arg_list");
            register_partial_file!(reg, "functions", "func_def");
            f.add_import("typing", "Awaitable");

            register_partial_file!(reg, "functions", "interface");
            f.add_import("typing", "runtime_checkable");
            f.add_import("typing", "Protocol");

            register_partial_file!(reg, "functions", "function_pyi");
            f.add_import("..._impl.functions", "BaseBAMLFunction");
            String::from("function_pyi")
        }
    }
}

pub(super) fn render_template(template: HSTemplate, f: &mut File, json: serde_json::Value) {
    let mut reg = init_hs();
    let template = use_partial(template, &mut reg, f);

    match reg.render_template(&format!("{{{{> {}}}}}", template), &json) {
        Ok(s) => {
            // info!("Rendered template:\n{}\n------\n", &s);
            f.add_string(&s)
        }
        Err(e) => panic!("Failed to render template: {}", e),
    }
}
